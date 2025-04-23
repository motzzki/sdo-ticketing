import dotenv from 'dotenv';
import express from 'express';
import conn from './conn.js';

const router = express.Router();
dotenv.config();

router.get("/schools", (req, res) => {
    const district = req.query.district;
    const query = "SELECT schoolCode, school FROM tbl_users WHERE district = ? AND role = 'Staff'";

    conn.query(query, [district], (err, results) => {
        console.log("Query results:", results); // Add this log
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

router.get("/schoolbatches", (req, res) => {
    const query = "SELECT * FROM tbl_batches";
    conn.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching batches:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(result);
    });
  });

  router.get("/deletedevice/:device_name", (req, res) => {
    const deviceName = decodeURIComponent(req.params.device_name);
  
    if (!deviceName) {
      return res.status(400).json({ error: "Device name is required" });
    }
  
    const query = "DELETE FROM tbl_devices WHERE device_name = ?";
    conn.query(query, [deviceName], (err, result) => {
      if (err) {
        console.error("Error deleting device:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Device deleted successfully" });
    });
  });
  
  
  
  

router.get("/batches/:schoolCode", (req, res) => {
    const { schoolCode } = req.params;
    console.log("Received schoolCode:", schoolCode); 

    const query = "SELECT * FROM tbl_batches WHERE schoolCode = ? AND status = 'Delivered'";

    conn.query(query, [schoolCode], (err, result) => {
        if (err) {
            console.error("Error fetching batches:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Fetched batches from DB:", result); 
        res.json(result);
    });
});


router.get("/receivebatch/:schoolCode", (req, res) => {
    const { schoolCode } = req.params;
    console.log("Received schoolCode:", schoolCode); 

    const query = "SELECT * FROM tbl_batches WHERE schoolCode = ? AND status = 'Pending'";

    conn.query(query, [schoolCode], (err, result) => {
        if (err) {
            console.error("Error fetching batches:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Fetched batches from DB:", result); 
        res.json(result);
    });
});

// Get devices for selection
router.get('/devices', (req, res) => {
    const query = 'SELECT device_name FROM tbl_devices';
    conn.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching devices:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(result); // Return the list of device names
    });
});


router.post("/adddevice", (req, res) => {
    const { device_name } = req.body; // Extract device_name from request body

    if (!device_name) {
        return res.status(400).json({ error: "Device name is required" });
    }

    const query = "INSERT INTO tbl_devices (device_name) VALUES (?)";
    conn.query(query, [device_name], (err, result) => {
        if (err) {
            console.error("Error adding device:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Added device:", result);
        res.json({ message: "Device added successfully", device_id: result.insertId });
    });
});


// Create a new batch
router.post("/createbatch", (req, res) => {
    const { batchNumber, sendDate, district, schoolCode, schoolName, devices } = req.body;

    // Get current date
   // Get current date (with time reset to midnight for proper date comparison)
const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

const sendDateObj = new Date(sendDate);
sendDateObj.setHours(0, 0, 0, 0);

// Determine batch status based on send date - only past dates are "Delivered"
const status = sendDateObj < currentDate ? "Delivered" : "Pending";
    
    // If the batch is in the past, set received date to the send date
    const receivedDate = status === "Delivered" ? sendDate : null;

    const query = "INSERT INTO tbl_batches (batch_number, send_date, schoolCode, school_name, status, received_date) VALUES (?, ?, ?, ?, ?, ?)";
    conn.query(
        query,
        [batchNumber, sendDate, schoolCode, schoolName, status, receivedDate],
        (err, result) => {
            if (err) {
                console.error("Error creating batch:", err.message);
                return res.status(500).json({ error: err.message });
            }
            const batchId = result.insertId;

            // Insert devices
            devices.forEach(device => {
                const deviceQuery = "INSERT INTO tbl_batch_devices (batch_id, device_type, device_number) VALUES (?, ?, ?)";
                conn.query(
                    deviceQuery,
                    [batchId, device.deviceType, device.serialNumber],
                    (err) => {
                        if (err) console.error("Error adding device:", err);
                    }
                );
            });

            res.json({ 
                message: "Batch created!", 
                batchId, 
                status 
            });
        }
    );
});

// Server-side route to get next batch number
router.get("/nextBatchNumber", (req, res) => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, "");
    const query = `
        SELECT batch_number 
        FROM tbl_batches 
        WHERE batch_number LIKE '${today}-%' 
        ORDER BY batch_number DESC 
        LIMIT 1`;

    conn.query(query, (err, results) => {
        if (err) {
            console.error("Error getting next batch number:", err);
            return res.status(500).json({ error: err.message });
        }

        let nextNumber = '0001';
        if (results.length > 0) {
            // Extract the current counter and increment it
            const currentNumber = results[0].batch_number.split('-')[1];
            nextNumber = (parseInt(currentNumber) + 1).toString().padStart(4, '0');
        }

        res.json({ nextBatchNumber: `${today}-${nextNumber}` });
    });
});

// router.get("/getbatches", (req, res) => {
//     const district = req.query.district;
//     const query = "SELECT schoolCode, school FROM tbl_users WHERE district = ? AND role = 'Staff'";

//     conn.query(query, [district], (err, results) => {
//         console.log("Query results:", results); // Add this log
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ error: err.message });
//         }
//         res.json(results);
//     });
// });

router.get("/received-batches", (req, res) => {
    const query = `
        SELECT 
            batch_id,
            batch_number,
            school_name,
            received_date
        FROM tbl_batches 
        WHERE status = 'Delivered' 
        AND received_date IS NOT NULL
        ORDER BY received_date DESC
    `;
    
    conn.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching received batches:", err.message);
            return res.status(500).json({ error: "Failed to fetch received batches" });
        }
        res.json(result);
    });
});

router.put("/receivebatch/:batchId", (req, res) => {
    const { batchId } = req.params;
    const query = `
        UPDATE tbl_batches 
        SET status = 'Delivered', 
            received_date = CURRENT_DATE() 
        WHERE batch_id = ?
    `;
    
    conn.query(query, [batchId], (err, result) => {
        if (err) {
            console.error("Error receiving batch:", err.message);
            return res.status(500).json({ error: "Failed to receive batch" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Batch not found" });
        }
        res.json({ message: "Batch received successfully" });
    });
});

router.get("/receivebatch/:schoolCode/pending", (req, res) => {
    const { schoolCode } = req.params;
    const query = `
        SELECT * FROM tbl_batches 
        WHERE schoolCode = ? 
        AND status = 'Pending'
        ORDER BY send_date DESC
    `;
    
    conn.query(query, [schoolCode], (err, result) => {
        if (err) {
            console.error("Error fetching pending batches:", err.message);
            return res.status(500).json({ error: "Failed to fetch pending batches" });
        }
        res.json(result);
    });
});

// Get received batches for a school
router.get("/receivebatch/:schoolCode/received", (req, res) => {
    const { schoolCode } = req.params;
    const query = `
        SELECT * FROM tbl_batches 
        WHERE schoolCode = ? 
        AND status = 'Delivered'
        ORDER BY received_date DESC
    `;
    
    conn.query(query, [schoolCode], (err, result) => {
        if (err) {
            console.error("Error fetching received batches:", err.message);
            return res.status(500).json({ error: "Failed to fetch received batches" });
        }
        res.json(result);
    });
});
router.get("/receivebatch/:schoolCode/:status", (req, res) => {
    const { schoolCode, status } = req.params;
    let orderByColumn;
    
    // Determine sorting based on status
    switch(status.toLowerCase()) {
        case 'received':
        case 'delivered':
            orderByColumn = 'received_date';
            break;
        case 'cancelled':
            orderByColumn = 'cancelled_date';
            break;
        default:
            orderByColumn = 'send_date';
    }
    
    // Safe query that works even if the column doesn't exist
    const query = `
        SELECT * FROM tbl_batches 
        WHERE schoolCode = ? 
        AND status = ?
        ORDER BY send_date DESC
    `;
    
    conn.query(query, [schoolCode, status === 'received' ? 'Delivered' : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()], (err, result) => {
        if (err) {
            console.error(`Error fetching ${status} batches:`, err.message);
            return res.status(500).json({ error: `Failed to fetch ${status} batches` });
        }
        res.json(result || []);
    });
});

router.get("/receivebatch/:schoolCode/cancelled", (req, res) => {
    const { schoolCode } = req.params;
    const query = `
        SELECT * FROM tbl_batches 
        WHERE schoolCode = ? 
        AND status = 'Cancelled'
        ORDER BY send_date DESC  /* Fallback to send_date if cancelled_date doesn't exist */
    `;
    
    conn.query(query, [schoolCode], (err, result) => {
        if (err) {
            console.error("Error fetching cancelled batches:", err.message);
            return res.status(500).json({ error: "Failed to fetch cancelled batches" });
        }
        res.json(result || []);
    });
});

router.put("/cancelbatch/:batchId", (req, res) => {
    const { batchId } = req.params;
    
    // First check if the batch exists and has the correct status
    const checkQuery = "SELECT status FROM tbl_batches WHERE batch_id = ?";
    
    conn.query(checkQuery, [batchId], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking batch:", checkErr.message);
        return res.status(500).json({ error: "Failed to check batch status" });
      }
      
      if (checkResult.length === 0) {
        return res.status(404).json({ error: "Batch not found" });
      }
      
      if (checkResult[0].status !== "Pending") {
        return res.status(400).json({ 
          error: "Only pending batches can be cancelled" 
        });
      }
      
      // Proceed with the update
      const updateQuery = `
        UPDATE tbl_batches 
        SET status = 'Cancelled', 
            cancelled_date = CURRENT_DATE() 
        WHERE batch_id = ?
      `;
      
      conn.query(updateQuery, [batchId], (err, result) => {
        if (err) {
          console.error("Error cancelling batch:", err.message);
          return res.status(500).json({ error: "Failed to cancel batch" });
        }
        
        res.json({ 
          message: "Batch cancelled successfully",
          batchId
        });
      });
    });
  });


router.get("/batch/:batchId/devices", (req, res) => {
    const { batchId } = req.params;
    const query = `
        SELECT device_type, device_number
        FROM tbl_batch_devices
        WHERE batch_id = ?
        ORDER BY device_type
    `;
    
    conn.query(query, [batchId], (err, result) => {
        if (err) {
            console.error("Error fetching batch devices:", err.message);
            return res.status(500).json({ error: "Failed to fetch batch devices" });
        }
        res.json(result);
    });
});

export default router;
    