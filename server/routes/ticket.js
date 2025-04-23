import express from "express";
import multer from "multer";
import path from "path";
import conn from "./conn.js";  // Ensure that your conn.js file is using ES module exports

const router = express.Router();

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        // Add timestamp to prevent filename collisions
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// Add file filter to restrict file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).array("attachments", 10);

router.get("/tickets", (req, res) => {
    const { showArchived } = req.query;
    const query = `
        SELECT * FROM tbl_tickets 
        WHERE archived = ?
        ORDER BY date DESC
    `;
    
    conn.query(query, [showArchived === 'true' ? 1 : 0], (err, result) => {
        if (err) {
            console.error("Error fetching tickets:", err.message);
            return res.status(500).json({ error: "Failed to fetch tickets" });
        }
        res.json(result);
    });
});

router.get("/api/tickets/:ticketNumber/devices", async (req, res) => {
  const { ticketNumber } = req.params;
  const query = `
    SELECT 
        t.ticketNumber,
        t.requestor,
        b.batch_id,
        b.batch_number,
        bd.device_type,
        bd.device_number,
        td.issue_description
    FROM tbl_tickets t
    JOIN tbl_ticket_devices td ON t.ticketId = td.ticket_id
    JOIN tbl_batch_devices bd ON td.batch_devices_id = bd.batch_devices_id
    JOIN tbl_batches b ON bd.batch_id = b.batch_id
    WHERE t.ticketNumber = ?
    ORDER BY bd.batch_devices_id;
  `;

  try {
    const [rows] = await db.execute(query, [ticketNumber]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching ticket devices:", error);
    res.status(500).json({ error: "Failed to fetch devices" });
  }
});



router.get("/ticketdevices", (req, res) => {
  const query = `
      SELECT 
          t.ticketNumber,
          t.requestor,
          b.batch_id,
          b.batch_number,
          bd.device_type,
          bd.device_number,
          td.issue_description
      FROM tbl_tickets t
      JOIN tbl_ticket_devices td ON t.ticketId = td.ticket_id
      JOIN tbl_batch_devices bd ON td.batch_devices_id = bd.batch_devices_id
      JOIN tbl_batches b ON bd.batch_id = b.batch_id
      ORDER BY bd.batch_devices_id;
  `;

  conn.query(query, (err, results) => {
      if (err) {
          console.error("Error fetching ticket devices:", err);
          return res.status(500).json({ error: "Database query failed" });
      }
      console.log("Query Results:", results); // Debugging step
      res.json(results);
  });
});




router.get('/getBatches/:schoolCode', (req, res) => {
    const { schoolCode } = req.params;

    console.log("Fetching batches for school code:", schoolCode); // Debug log

    const query = `
        SELECT 
            batch_id,
            batch_number,
            send_date,
            status
        FROM tbl_batches 
        WHERE schoolCode = ?
        ORDER BY send_date DESC
    `;

    conn.query(query, [schoolCode], (err, results) => {
        if (err) {
            console.error('Error fetching batches:', err.message);
            return res.status(500).json({ 
                message: 'Error fetching batches',
                error: err.message 
            });
        }

        console.log("Found batches:", results); // Debug log

        // Return an empty array if no batches found
        res.json(results.length > 0 ? results : []);
    });
});

router.post("/createTickets", (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { requestor, category, request, comments, status, batch } = req.body;
    let selectedDevices = [];

    // Parse selectedDevices if present, ensuring correct format
    console.log("Raw selectedDevices:", req.body.selectedDevices);

    if (req.body.selectedDevices) {
      try {
        let rawDevices = req.body.selectedDevices;
    
        // Handle cases where selectedDevices is an array but contains a single stringified JSON
        if (Array.isArray(rawDevices) && rawDevices.length === 2 && typeof rawDevices[1] === "string") {
          rawDevices = rawDevices[1];
        }
    
        selectedDevices = JSON.parse(rawDevices);
        console.log("Parsed Selected Devices:", selectedDevices);
      } catch (e) {
        console.error("Error parsing selectedDevices:", e.message);
        return res.status(400).json({ error: "Invalid JSON format for selectedDevices: " + e.message });
      }
    }
    

    const attachments = req.files ? req.files.map(file => file.filename) : [];
    const ticketNumber = `${Date.now().toString().slice(-6)}${Math.floor(10000 + Math.random() * 90000)}`;


    // Validate required fields
    if (!requestor || !category || !request) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (category === "Hardware" && !batch) {
      return res.status(400).json({ error: "Batch is required for hardware issues" });
    }

    // Use transaction to ensure both ticket and devices are saved or none
    conn.beginTransaction(err => {
      if (err) {
        console.error("Transaction error:", err);
        return res.status(500).json({ error: "Database transaction failed" });
      }

      const ticketQuery = `
        INSERT INTO tbl_tickets 
        (ticketNumber, requestor, category, request, comments, attachments, status, date, batch_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `;

      conn.query(
        ticketQuery,
        [ticketNumber, requestor, category, request, comments, JSON.stringify(attachments), status || 'Pending', batch || null],
        (err, result) => {
          if (err) {
            return conn.rollback(() => {
              console.error("Database error:", err);
              res.status(500).json({ error: "Failed to create ticket" });
            });
          }

          const ticketId = result.insertId;

          // If hardware category and devices selected, insert device records
          if (category === "Hardware" && selectedDevices.length > 0) {
            // First, we need to get the batch_devices_id for each device number
            const deviceNumbers = selectedDevices.map(device => device.deviceId);

            // Query to get the batch_devices_id for each device number
            const getDeviceIdsQuery = `
              SELECT batch_devices_id, device_number 
              FROM tbl_batch_devices 
              WHERE batch_id = ? AND device_number IN (?)
            `;

            conn.query(getDeviceIdsQuery, [batch, deviceNumbers], (err, deviceRows) => {
              if (err) {
                return conn.rollback(() => {
                  console.error("Error getting device IDs:", err);
                  res.status(500).json({ error: "Failed to retrieve device IDs" });
                });
              }

              // Create a mapping of device_number to batch_devices_id
              const deviceIdMap = {};
              deviceRows.forEach(row => {
                deviceIdMap[row.device_number] = row.batch_devices_id;
              });

              // Prepare device insertion queries with the correct IDs and descriptions
              const deviceRecords = selectedDevices
                .filter(device => deviceIdMap[device.deviceId]) // Only include devices we found IDs for
                .map(device => [
                  ticketId,
                  deviceIdMap[device.deviceId],
                  device.description || `Issue with device ${device.deviceId}`
                ]);

              if (deviceRecords.length === 0) {
                return conn.rollback(() => {
                  console.error("No valid devices found");
                  res.status(400).json({ error: "No valid devices found in the batch" });
                });
              }

              const deviceQuery = `
                INSERT INTO tbl_ticket_devices 
                (ticket_id, batch_devices_id, issue_description) 
                VALUES ?
              `;

              conn.query(deviceQuery, [deviceRecords], (err) => {
                if (err) {
                  return conn.rollback(() => {
                    console.error("Device association error:", err);
                    res.status(500).json({ error: "Failed to associate devices with ticket" });
                  });
                }

                // Commit the transaction
                conn.commit(err => {
                  if (err) {
                    return conn.rollback(() => {
                      console.error("Commit error:", err);
                      res.status(500).json({ error: "Failed to commit transaction" });
                    });
                  }

                  // Success response
                  res.json({
                    message: "Ticket submitted successfully",
                    ticketNumber,
                    ticketId
                  });
                });
              });
            });
          } else {
            // No devices to associate, just commit the ticket
            conn.commit(err => {
              if (err) {
                return conn.rollback(() => {
                  console.error("Commit error:", err);
                  res.status(500).json({ error: "Failed to commit transaction" });
                });
              }

              // Success response
              res.json({
                message: "Ticket submitted successfully",
                ticketNumber,
                ticketId
              });
            });
          }
        }
      );
    });
  });
});



router.put("/tickets/:ticketId/status", (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;

    console.log(`Received ticketId: ${ticketId} and status: ${status}`);

    const validStatuses = ["Completed", "Pending", "On Hold", "In Progress", "Rejected"];
    
    if (!validStatuses.includes(status)) {
        console.log(`Invalid status: ${status}`);
        return res.status(400).json({ error: "Invalid status" });
    }

    const query = `
        UPDATE tbl_tickets 
        SET status = ?, 
            closedAt = ${status === 'Completed' ? 'NOW()' : 'NULL'}
        WHERE ticketId = ?
    `;

    console.log("Generated query:", query);  // Log the generated query for debugging purposes

    conn.query(query, [status, ticketId], (err, result) => {
        if (err) {
            console.error("Database error:", err);  // Log the actual error object
            return res.status(500).json({ error: "Failed to update ticket status" });
        }

        console.log("Query result:", result);  // Log the result of the query for debugging purposes

        if (result.affectedRows === 0) {
            console.log("No rows affected. Ticket might not exist.");
            return res.status(404).json({ error: "Ticket not found" });
        }

        console.log("Ticket status updated successfully");
        res.json({ message: "Ticket status updated successfully" });
    });
});

router.get("/tickets/:username/:status", (req, res) => {
    const { username, status } = req.params;
    
    const validStatuses = ["Completed", "Pending", "On Hold", "In Progress", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
  
    const query = `
      SELECT * FROM tbl_tickets 
      WHERE requestor = ? 
      AND status = ?
      AND archived = 0
      ORDER BY date DESC
    `;
  
    conn.query(query, [username, status], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to fetch tickets" });
      }
      res.json(results);
    });
});


  router.put("/tickets/:ticketId/archive", (req, res) => {
    const { ticketId } = req.params;
    
    const query = `
        UPDATE tbl_tickets 
        SET archived = 1
        WHERE ticketId = ?
    `;

    conn.query(query, [ticketId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to delete ticket" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        res.json({ message: "Ticket deleted successfully" });
    });
});

router.get('/issues', (req, res) => {
  const query = 'SELECT * FROM tbl_issues';
  conn.query(query, (err, result) => {
      if (err) {
          console.error('Error fetching issues:', err.message);
          return res.status(500).json({ error: err.message });
      }
      res.json(result);
  });
});


router.post("/addIssue", (req, res) => {
  const { issue_name, issue_category } = req.body;

  if (!issue_name) {
      return res.status(400).json({ error: "Issue name is required" });
  }

  if (!issue_category) {
      return res.status(400).json({ error: "Issue category is required" });
  }

  const query = "INSERT INTO tbl_issues (issue_name, issue_category) VALUES (?, ?)";
  conn.query(query, [issue_name, issue_category], (err, result) => {
      if (err) {
          console.error("Error adding issue:", err.message);
          return res.status(500).json({ error: err.message });
      }
      console.log("Added issue:", result);
      res.json({ message: "Issue added successfully", issue_id: result.insertId });
  });
});

router.get("/deleteissue/:issue_id", (req, res) => {
  const issueId = parseInt(req.params.issue_id, 10);

  if (isNaN(issueId)) {
    return res.status(400).json({ error: "Invalid issue ID" });
  }

  const query = "DELETE FROM tbl_issues WHERE issue_id = ?";
  conn.query(query, [issueId], (err, result) => {
    if (err) {
      console.error("Error deleting issue:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json({ message: "Issue deleted successfully" });
  });
});
  
export default router;