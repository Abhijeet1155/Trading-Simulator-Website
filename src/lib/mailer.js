import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transporter instance based on environment variables.
 */
export function createTransporter() {
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : null;
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : null;

  if (!user || !pass) {
    console.warn(
      '[Mailer Warning] SMTP environment variables (SMTP_USER, SMTP_PASS) are not fully configured. Email sending will be logged to console.'
    );
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });
}

/**
 * Generates and sends a branded Password Reset HTML email to the user.
 * 
 * @param {Object} params
 * @param {string} params.toEmail
 * @param {string} params.name
 * @param {string} params.resetUrl
 */
export async function sendPasswordResetEmail({ toEmail, name, resetUrl }) {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || `"PaperPulse" <${process.env.SMTP_USER || 'no-reply@paperpulse.com'}>`;
  const recipientName = name ? name.trim() : 'Trader';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - PaperPulse</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #FAFAFA;
      margin: 0;
      padding: 0;
      color: #111111;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 520px;
      margin: 40px auto;
      background-color: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }
    .header {
      padding: 32px 32px 24px;
      text-align: center;
      border-bottom: 1px solid #F3F4F6;
    }
    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background-color: #2563EB;
      border-radius: 10px;
      display: inline-block;
      vertical-align: middle;
      text-align: center;
      line-height: 36px;
      color: #FFFFFF;
      font-weight: 600;
      font-size: 18px;
    }
    .brand-name {
      font-size: 22px;
      font-weight: 600;
      color: #111111;
      
      vertical-align: middle;
    }
    .content {
      padding: 32px;
    }
    h1 {
      font-size: 22px;
      font-weight: 600;
      color: #111111;
      margin: 0 0 16px;
      
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #4B5563;
      margin: 0 0 20px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .reset-button {
      display: inline-block;
      background-color: #2563EB;
      color: #FFFFFF !important;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }
    .expiry-note {
      background-color: #F8FAFC;
      border-left: 4px solid #2563EB;
      padding: 14px 16px;
      border-radius: 6px;
      font-size: 13px;
      color: #64748B;
      margin: 24px 0;
    }
    .link-fallback {
      font-size: 12px;
      color: #9CA3AF;
      word-break: break-all;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px dashed #E5E7EB;
    }
    .link-fallback a {
      color: #2563EB;
      text-decoration: underline;
    }
    .footer {
      padding: 24px 32px;
      background-color: #FAFAFA;
      border-top: 1px solid #F3F4F6;
      text-align: center;
      font-size: 12px;
      color: #9CA3AF;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="brand-logo">
        <span class="logo-icon">&#9650;</span>
        <span class="brand-name">PaperPulse</span>
      </div>
    </div>
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>Hi ${recipientName},</p>
      <p>We received a request to reset your password for your PaperPulse account. Click the button below to choose a new password:</p>
      
      <div class="button-container">
        <a href="${resetUrl}" target="_blank" class="reset-button">Reset Password</a>
      </div>

      <div class="expiry-note">
        &#9200; <strong>Note:</strong> This link will expire in <strong>30 minutes</strong> for security reasons.
      </div>

      <div class="link-fallback">
        If the button above doesn't work, copy and paste this URL into your web browser:<br>
        <a href="${resetUrl}">${resetUrl}</a>
      </div>
    </div>
    <div class="footer">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.<br><br>
      &copy; ${new Date().getFullYear()} PaperPulse. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;

  if (!transporter) {
    console.log('====================================================');
    console.log('[DEV MODE] Nodemailer SMTP credentials not configured.');
    console.log(`[DEV MODE] Password Reset Link for ${toEmail}:`);
    console.log(resetUrl);
    console.log('====================================================');
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: 'Reset Your Password - PaperPulse',
      html: htmlContent,
    });

    console.log('[Mailer Success] Password reset email sent successfully to', toEmail, 'MessageID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer Error] Failed to send password reset email via Gmail SMTP:');
    console.error(error);
    return { success: false, error: error.message || error };
  }
}

/**
 * Generates and sends a welcome email to a new user.
 * 
 * @param {Object} params
 * @param {string} params.toEmail
 * @param {string} params.name
 */
export async function sendWelcomeEmail({ toEmail, name }) {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || `"PaperPulse" <${process.env.SMTP_USER || 'no-reply@paperpulse.com'}>`;
  const recipientName = name ? name.trim() : 'Trader';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to PaperPulse!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAFAFA; margin: 0; padding: 0; color: #111111; }
    .container { max-width: 520px; margin: 40px auto; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
    h1 { font-size: 22px; font-weight: 600; color: #111; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.6; color: #4B5563; }
    .btn { display: inline-block; background: #2563EB; color: #fff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 10px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to PaperPulse, ${recipientName}! 🚀</h1>
    <p>Thank you for joining PaperPulse. You can now start practicing paper trading, tracking real-time stock data, and building your risk-free portfolio.</p>
    <p>Log in anytime to explore live trading competitions, monitor market updates, and analyze your performance.</p>
    <div style="text-align: center;">
      <a href="http://localhost:3000/dashboard" class="btn">Go to Dashboard</a>
    </div>
  </div>
</body>
</html>
  `;

  if (!transporter) {
    console.log('[DEV MODE] Welcome email simulated for:', toEmail);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: 'Welcome to PaperPulse! 🚀',
      html: htmlContent,
    });
    console.log('[Mailer Success] Welcome email sent successfully to', toEmail, 'MessageID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer Error] Failed to send welcome email via Gmail SMTP:', error);
    return { success: false, error: error.message || error };
  }
}

