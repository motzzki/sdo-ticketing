import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import conn from "./conn.js";

const router = express.Router();

// Workaround for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Headers
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "deped_uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, DOCS and PDF allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "proofOfIdentity", maxCount: 1 },
  { name: "prcID", maxCount: 1 },
  { name: "endorsementLetter", maxCount: 1 },
]);

router.use(express.json());

// === Account Request ===
router.post("/request-deped-account", (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      console.error("Upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    const requestNumber = generateRequestTicketNumber();
    const {
      selectedType, surname, firstName, middleName,
      designation, school, schoolID, personalGmail,
    } = req.body;

    if (!selectedType || !surname || !firstName || !designation || !school || !schoolID || !personalGmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const fullName = `${surname}, ${firstName} ${middleName || ""}`.trim();
    const proofOfIdentity = req.files?.proofOfIdentity?.[0]?.filename;
    const prcID = req.files?.prcID?.[0]?.filename;
    const endorsementLetter = req.files?.endorsementLetter?.[0]?.filename;

    if (!proofOfIdentity || !prcID || !endorsementLetter) {
      return res.status(400).json({ error: "All files are required" });
    }

    const query = `
      INSERT INTO deped_account_requests
      (requestNumber, selected_type, name, surname, first_name, middle_name, designation, school, school_id, personal_gmail,
       proof_of_identity, prc_id, endorsement_letter)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    conn.query(query, [
      requestNumber, selectedType, fullName, surname, firstName, middleName || "",
      designation, school, schoolID, personalGmail,
      proofOfIdentity, prcID, endorsementLetter
    ], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Failed to submit request", dbError: err.message });
      }
      res.json({ message: "Request submitted", requestId: result.insertId, requestNumber });
    });
  });
});

// === Reset Request ===
router.post("/reset-deped-account", (req, res) => {
  const resetNumber = generateResetTicketNumber();
  const { selectedType, surname, firstName, middleName, school, schoolID, employeeNumber } = req.body;

  if (!selectedType || !surname || !firstName || !school || !schoolID || !employeeNumber) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const fullName = `${surname}, ${firstName} ${middleName || ""}`.trim();

  const query = `
    INSERT INTO deped_account_reset_requests
    (resetNumber, selected_type, name, surname, first_name, middle_name, school, school_id, employee_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  conn.query(query, [
    resetNumber, selectedType, fullName, surname, firstName, middleName || "", school, schoolID, employeeNumber
  ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to submit reset request", dbError: err.message });
    }
    res.json({ message: "Reset request submitted", requestId: result.insertId, resetNumber });
  });
});

// === Get Schools ===
router.get("/schoolList", (req, res) => {
  const query = "SELECT schoolCode, school FROM tbl_users GROUP BY schoolCode, school";
  conn.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// === View Requests ===
router.get("/deped-account-requests", (req, res) => {
  conn.query("SELECT * FROM deped_account_requests ORDER BY created_at ASC", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch account requests" });
    res.json(results);
  });
});

router.get("/deped-account-reset-requests", (req, res) => {
  conn.query("SELECT * FROM deped_account_reset_requests ORDER BY created_at ASC", (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch reset requests" });
    res.json(results);
  });
});

// === Update Status ===
router.put("/deped-account-requests/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  conn.query("UPDATE deped_account_requests SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update status" });
    res.json({ message: "Status updated" });
  });
});

router.put("/deped-account-reset-requests/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const query = `
    UPDATE deped_account_reset_requests
    SET status = ?, notes = ?, completed_at = ${status === "completed" ? "CURRENT_TIMESTAMP" : "NULL"}
    WHERE id = ?
  `;

  conn.query(query, [status, notes, id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update status" });
    res.json({ message: "Status updated" });
  });
});

// === Check Transaction ===
router.get("/check-transaction", (req, res) => {
  const { number } = req.query;
  if (!number) return res.status(400).json({ error: "Transaction number is required" });

  const isRequest = number.startsWith("REQ-");
  const isReset = number.startsWith("RST-");

  if (!isRequest && !isReset) {
    return res.status(400).json({ error: "Invalid transaction number" });
  }

  const query = isRequest
    ? "SELECT requestNumber AS number, name, school, status, '' AS notes FROM deped_account_requests WHERE requestNumber = ?"
    : "SELECT resetNumber AS number, name, school, status, notes FROM deped_account_reset_requests WHERE resetNumber = ?";

  conn.query(query, [number], (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to check transaction" });
    res.json(results);
  });
});

// === Ticket Generators ===
function generateRequestTicketNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters = letters[Math.floor(Math.random() * 26)] + letters[Math.floor(Math.random() * 26)];
  const timestampDigits = Date.now().toString().slice(-6);
  const randomNumbers = Math.floor(10000 + Math.random() * 90000);
  return `REQ-${randomLetters}${timestampDigits}${randomNumbers}`;
}

function generateResetTicketNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters = [...Array(3)].map(() => letters[Math.floor(Math.random() * 26)]).join("");
  const timestampDigits = Date.now().toString().slice(-4);
  const randomNumbers = Math.floor(100000 + Math.random() * 900000);
  return `RST-${randomLetters}${timestampDigits}${randomNumbers}`;
}

export default router;
