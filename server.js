const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();


const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
// app.set('view engine', 'ejs'); // REMOVED
app.use(express.static('public')); // ADDED
app.use(bodyParser.urlencoded({ extended: true }));

// --- IN-MEMORY DATABASE ---
// In a real app, this would be a SQL or NoSQL database.
// Format: { "token-string" : "user@email.com" }
const resetTokens = new Map();

// --- EMAIL TRANSPORTER (GMAIL) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// --- ROUTES ---

// 1. Login Page
// Served automatically by express.static (index.html)

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Simple Logic: Email must have '@' and password > 5 chars
    if (email.includes('@') && password.length > 5) {
        res.redirect('/landing.html');
    } else {
        res.redirect('/?error=Invalid email or password (must be > 5 chars)');
    }
});

// 2. Landing Page (Successful Login)
// Served automatically by express.static (landing.html)

// 3. Request Reset Page
// Served automatically by express.static (request-reset.html)

app.post('/request-reset', (req, res) => {
    const { email } = req.body;

    if (!email.includes('@')) {
        return res.redirect('/request-reset.html?message=Please enter a valid email.');
    }

    // Generate a unique token
    const token = uuidv4();

    // Save token to "Database"
    resetTokens.set(token, email);

    // Create the reset link
    const resetLink = `http://localhost:${PORT}/reset/${token}`;

    // Send the Email
    const mailOptions = {
        from: 'Password Demo <noreply@demo.com>',
        to: email,
        subject: 'Reset Your Password',
        text: `Click this link to reset your password: ${resetLink}`,
        html: `<p>You requested a password reset.</p><p>Click here: <a href="${resetLink}">Reset Password</a></p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.redirect('/request-reset.html?message=Error sending email. Check server console.');
        }
        console.log('Email sent: ' + info.response);
        res.redirect(`/request-reset.html?message=Check ${email} for the reset link!`);
    });
});

// 4. Reset Password Form (Access via Email Link)
app.get('/reset/:token', (req, res) => {
    const { token } = req.params;

    // Verify token exists
    if (resetTokens.has(token)) {
        // Serve the static file. The client-side JS will extract the token from the URL.
        res.sendFile(path.join(__dirname, 'public', 'reset-form.html'));
    } else {
        res.send('<h1>Invalid or Expired Token</h1><a href="/">Go Back</a>');
    }
});

app.post('/reset-password', (req, res) => {
    const { token, password } = req.body;

    // Verify token again
    if (!resetTokens.has(token)) {
        return res.send('Invalid token.');
    }

    // Validate new password
    if (password.length > 5) {
        // In a real app, you would update the user's password in the DB here

        // Delete the used token (Single Use)
        resetTokens.delete(token);

        res.redirect('/confirmation.html');
    } else {
        // Redirect back to the reset form with the token and error
        // Note: We need to redirect to the same URL structure /reset/:token so the file is served correctly
        // OR we can redirect to /reset/:token?error=...
        res.redirect(`/reset/${token}?error=Password must be > 5 chars`);
    }
});

// 5. Confirmation Page
// Served automatically by express.static (confirmation.html)

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});