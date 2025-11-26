## Password Reset Demo

This is a simple password reset demo using Node.js, Express, and Nodemailer.

In order for this to work, you'll need an app password from your Gmail. So the reset password is actually sent from your Gmail account.

To get an app password from Gmail, go to your Google Account settings > Security > App Passwords and create an app password. Then, add the following environment variables to your .env file:

GMAIL_USER=your-gmail-address
GMAIL_PASSWORD=your-app-password

Finally you just run `node server.js` and navigate to `http://localhost:3000` in your browser.