import dotenv from 'dotenv';
import express from 'express';
import conn from './conn.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const router = express.Router();
const secretKey = process.env.SECRET_KEY;
const LoginAttempts = {}; // In-memory attempt tracker

router.post("/login", async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const { username, password } = req.body;
    const currentTime = Date.now();

    // Handle blocking logic
    const attempt = LoginAttempts[username];
    if (attempt && attempt.count >= 3) {
        const timePassed = (currentTime - attempt.firstAttemptTime) / 1000;
        const retryAfter = Math.max(60 - timePassed, 0);

        if (retryAfter > 0) {
            return res.status(429).json({
                message: "Too many login attempts. Try again later.",
                retryAfter: Math.ceil(retryAfter)
            });
        }
        delete LoginAttempts[username]; // Reset attempts
    }

    // Query user
    conn.query("SELECT * FROM tbl_users WHERE username = ?", [username], async (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return handleLoginFailure(username, currentTime, res);
        }

        const user = results[0];

        // One-time migration: hash plain-text passwords
        if (!user.password.startsWith("$2b$")) {
            try {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                conn.query(
                    "UPDATE tbl_users SET password = ? WHERE userId = ?",
                    [hashedPassword, user.userId],
                    (updateErr) => {
                        if (updateErr) {
                            console.error("Error updating password:", updateErr);
                        } else {
                            console.log(`Password hashed for user ${user.userId}`);
                        }
                    }
                );
                user.password = hashedPassword;
            } catch (err) {
                console.error("Password hashing error:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return handleLoginFailure(username, currentTime, res);
        }

        const userData = {
            id: user.userId,
            username: user.username,
            school: user.school,
            schoolCode: user.schoolCode,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role
        };

        const token = jwt.sign(userData, secretKey, { expiresIn: "1h" });

        delete LoginAttempts[username];

        return res.json({ message: "Login successful", token });
    });
});

function handleLoginFailure(username, currentTime, res) {
    if (!LoginAttempts[username]) {
        LoginAttempts[username] = { count: 1, firstAttemptTime: currentTime };
    } else {
        LoginAttempts[username].count += 1;
    }

    const attempt = LoginAttempts[username];

    if (attempt.count >= 3) {
        return res.status(429).json({
            message: "Too many login attempts. Try again later.",
            retryAfter: 60,
        });
    }

    return res.status(401).json({
        message: "Invalid username or password",
        remainingAttempts: 3 - attempt.count,
    });
}

export default router;
