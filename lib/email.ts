import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmailOTP(email: string, code: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@mrkim.com',
    to: email,
    subject: 'Your Verification Code - Mr. Kim',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Main Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 3px solid #15803d;">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: lightgreen;">
                      <img src="https://www.mrkim.co.ke/images/mrkim-logo.svg" alt="Mr. Kim Logo" width="100" height="100" style="display: block; margin: 0 auto 20px;">
                      <h1 style="margin: 0; color: green; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Email Verification</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Hello,
                      </p>
                      <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                        Thank you for choosing Mr. Kim! To complete your registration, please use the verification code below:
                      </p>
                      
                      <!-- Verification Code -->
                      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px dashed #15803d; border-radius: 12px; padding: 30px; margin: 32px 0; text-align: center;">
                        <p style="margin: 0 0 12px; color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                        <h2 style="margin: 0; color: #15803d; font-size: 42px; font-weight: 800; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                          ${code}
                        </h2>
                      </div>
                      
                      <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        ⏱️ This code will expire in <strong style="color: #374151;">10 minutes</strong>.
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        🔒 If you didn't request this code, please ignore this email or contact our support team if you have concerns.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="text-align: center; padding-bottom: 16px;">
                            <p style="margin: 0 0 12px; color: #15803d; font-size: 18px; font-weight: 700;">Mr. Kim</p>
                            <p style="margin: 0 0 16px; color: #6b7280; font-size: 13px; line-height: 1.5;">
                              Your trusted platform for quality services
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="text-align: center; padding-bottom: 16px;">
                            <a href="https://www.mrkim.co.ke" style="display: inline-block; margin: 0 8px; color: #15803d; text-decoration: none; font-size: 13px; font-weight: 500;">Website</a>
                            <span style="color: #d1d5db;">•</span>
                            <a href="https://www.mrkim.co.ke/support" style="display: inline-block; margin: 0 8px; color: #15803d; text-decoration: none; font-size: 13px; font-weight: 500;">Support</a>
                            <span style="color: #d1d5db;">•</span>
                            <a href="https://www.mrkim.co.ke/privacy" style="display: inline-block; margin: 0 8px; color: #15803d; text-decoration: none; font-size: 13px; font-weight: 500;">Privacy</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="text-align: center;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                              © ${new Date().getFullYear()} Mr. Kim. All rights reserved.
                            </p>
                            <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                              Nairobi, Kenya
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}
