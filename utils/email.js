// Structure: server/utils/email.js
const nodemailer = require('nodemailer');

const createEmailTemplate = (verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Fitness Buddy</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #4CAF50;
        }
        h1 {
          color: #333;
          font-size: 24px;
          margin-bottom: 20px;
          text-align: center;
        }
        p {
          margin-bottom: 20px;
          color: #666;
        }
        .button {
          display: block;
          width: fit-content;
          margin: 30px auto;
          padding: 14px 32px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 25px;
          font-weight: bold;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #888;
        }
        .expiry-note {
          font-size: 13px;
          color: #888;
          text-align: center;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <div class="logo">
            <div class="logo-text">Fitness Buddy</div>
          </div>
          <h1>Welcome to Fitness Buddy!</h1>
          <p>Thank you for joining Fitness Buddy. To start your fitness journey with us, please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          <p class="expiry-note">This verification link will expire in 24 hours.</p>
          <div class="footer">
            <p>If you didn't create an account with Fitness Buddy, please ignore this email.</p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="font-size: 12px; word-break: break-all; color: #666;">${verificationUrl}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Extract verification URL from message if it exists
    const verificationUrl = message.includes('verify-email') 
      ? message.match(/https?:\/\/[^\s]+/)?.[0] 
      : null;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
      to: email,
      subject: subject,
      // If it's a verification email, use HTML template, otherwise send plain text
      ...(verificationUrl 
        ? { html: createEmailTemplate(verificationUrl) }
        : { text: message }
      )
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };
