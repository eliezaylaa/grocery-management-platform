const nodemailer = require('nodemailer');

// Create transporter with better config
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.replace(/\s/g, ''), // Remove spaces from app password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

exports.sendPasswordResetEmail = async (email, resetToken, firstName) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Trinity Grocery" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Trinity Grocery',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Trinity Grocery</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName || 'there'}!</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button" style="color: white;">Reset My Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ This link expires in 1 hour.</strong><br>
              If you didn't request this password reset, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Trinity Grocery. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    console.log('Attempting to send email to:', email);
    console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
};

exports.sendPasswordChangedEmail = async (email, firstName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Trinity Grocery" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Changed Successfully - Trinity Grocery',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Trinity Grocery</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName || 'there'}!</h2>
            
            <div class="success">
              <h3 style="color: #059669; margin: 0;">✅ Password Changed Successfully</h3>
            </div>
            
            <p style="margin-top: 20px;">Your password has been changed successfully. You can now log in with your new password.</p>
            
            <p>If you didn't make this change, please contact support immediately.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Trinity Grocery. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Password changed email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Password changed email failed:', error.message);
    // Don't throw - this is not critical
  }
};
