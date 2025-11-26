const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();


const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
app.set('view engine', 'ejs');
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
app.get('/', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Simple Logic: Email must have '@' and password > 5 chars
    if (email.includes('@') && password.length > 5) {
        res.redirect('/landing');
    } else {
        res.render('login', { error: 'Invalid email or password (must be > 5 chars)' });
    }
});

// 2. Landing Page (Successful Login)
app.get('/landing', (req, res) => {
    res.render('landing');
});

// 3. Request Reset Page
app.get('/request-reset', (req, res) => {
    res.render('request-reset', { message: null });
});

app.post('/request-reset', (req, res) => {
    const { email } = req.body;

    if (!email.includes('@')) {
        return res.render('request-reset', { message: 'Please enter a valid email.' });
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
            return res.render('request-reset', { message: 'Error sending email. Check server console.' });
        }
        console.log('Email sent: ' + info.response);
        res.render('request-reset', { message: `Check ${email} for the reset link!` });
    });
});

// 4. Reset Password Form (Access via Email Link)
app.get('/reset/:token', (req, res) => {
    const { token } = req.params;

    // Verify token exists
    if (resetTokens.has(token)) {
        res.render('reset-form', { token: token, error: null });
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

        res.redirect('/confirmation');
    } else {
        res.render('reset-form', { token: token, error: 'Password must be > 5 chars' });
    }
});

// 5. Confirmation Page
app.get('/confirmation', (req, res) => {
    res.render('confirmation');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});