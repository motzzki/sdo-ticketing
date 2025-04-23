import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static file paths
const depedMainPath = path.resolve(__dirname, "..");
const staticFilesPath = path.join(depedMainPath, "client", "dist");
console.log("Static files path:", staticFilesPath);

// CORS options


// Middleware
app.use(express.json());
app.use(cors({
  credentials: true, 
  methods: 'GET,POST,PUT,DELETE', 
  origin: "https://ticketing.sdocabuyao.com" 
}));

// Import routes
import conn from "./routes/conn.js";
import loginRoutes from "./routes/login.js";
import ticketRoutes from "./routes/ticket.js";
import batchRoutes from "./routes/batch.js";
import resetRoutes from "./routes/reset.js";
import depedRoutes from "./routes/depedacc.js";

// Apply routes
app.use(conn);
app.use(loginRoutes);
app.use( ticketRoutes);
app.use( batchRoutes);
app.use( resetRoutes);
app.use( depedRoutes);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/deped_uploads", express.static(path.join(__dirname, "deped_uploads")));
app.use(express.static(staticFilesPath));
app.use("/assets", express.static(path.join(staticFilesPath, "assets")));

// Optional: Catch-all for unsupported POST requests (for debugging)
app.post("*", (req, res) => {
  res.status(404).json({ error: "No matching POST route" });
});

// ✅ SPA fallback only for GET requests
app.get("*", (req, res) => {
  res.sendFile(path.join(staticFilesPath, "index.html"));
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server started on port ${port}`);
});
