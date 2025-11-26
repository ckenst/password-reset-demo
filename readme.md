## Password Reset Demo

This is a simple but fully functional password reset demo using Node.js, Express, and Nodemailer.

Demo Functionality:

1. You can request a password reset, using your email address
2. Your Gmail account will send the reset email to the email address you provided
3. You can click the reset link to reset your password in the app
4. You can login with your new password in the app


## Prerequisites

In order for this to work, you'll need an app password from your Gmail. That's because the reset password is actually sent from your Gmail account.
To get an app password from Gmail, go to your Google Account settings > Security > App Passwords and create an app password. Then, add the following environment variables to your .env file:

```
GMAIL_USER=your-gmail-address
GMAIL_PASSWORD=your-app-password
```
Finally you just run `node server.js` and navigate to `http://localhost:3000` in your browser.