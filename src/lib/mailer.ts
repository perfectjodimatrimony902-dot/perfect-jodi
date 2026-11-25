import nodemailer from "nodemailer";

/**
 * Creates and configures Nodemailer transporter using Gmail SMTP
 */
export function getEmailTransporter() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error(
      "Email credentials missing. Please ensure EMAIL_USER and EMAIL_PASS are set in environment variables.",
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends a 6-digit OTP verification email to the registering user
 */
export async function sendOtpEmail(toEmail: string, otp: string, name?: string) {
  const transporter = getEmailTransporter();
  const fromEmail = process.env.EMAIL_USER?.trim();
  const recipientName = name?.trim() || "Valued Member";
  const normalizedTo = toEmail.trim().toLowerCase();

  const mailOptions = {
    from: `"Perfect Jodi Matrimony" <${fromEmail}>`,
    to: normalizedTo,
    subject: `${otp} is your Perfect Jodi Email Verification Code`,
    text: `Hello ${recipientName},\n\nYour verification code is: ${otp}\n\nThis code will expire in 5 minutes.\nPlease do not share this OTP with anyone.\n\nWarm regards,\nPerfect Jodi Matrimony Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fcf9f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #292524;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fcf9f5; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="540" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #f2e9dc;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #881337 0%, #4c0519 100%); padding: 32px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                      Perfect Jodi
                    </h1>
                    <p style="margin: 6px 0 0; color: #fde047; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">
                      जहाँ रिश्ते बनें खास · Premium Matrimony
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 32px 28px;">
                    <h2 style="margin: 0 0 12px; color: #1c1917; font-size: 20px; font-weight: 600;">
                      Verify your email address
                    </h2>
                    <p style="margin: 0 0 20px; color: #57534e; font-size: 15px; line-height: 1.6;">
                      Hello <strong>${recipientName}</strong>,
                    </p>
                    <p style="margin: 0 0 24px; color: #57534e; font-size: 14px; line-height: 1.6;">
                      Thank you for beginning your journey with <strong>Perfect Jodi</strong>. To complete your registration and secure your matrimonial account, please use the 6-digit One-Time Password (OTP) below:
                    </p>

                    <!-- OTP Code Box -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                      <tr>
                        <td align="center">
                          <div style="background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 16px; padding: 18px 24px; display: inline-block;">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #881337; display: block;">
                              ${otp}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 20px 0 8px; color: #78716c; font-size: 13px; text-align: center;">
                      ⏱ This code is valid for <strong>5 minutes</strong>.
                    </p>
                    <p style="margin: 0 0 24px; color: #dc2626; font-size: 12px; text-align: center;">
                      For your safety, never share this OTP with anyone, including Perfect Jodi staff.
                    </p>

                    <hr style="border: none; border-top: 1px solid #f5f5f4; margin: 28px 0;">

                    <p style="margin: 0; color: #a8a29e; font-size: 12px; line-height: 1.5; text-align: center;">
                      If you did not request this verification, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #fafaf9; padding: 20px 30px; text-align: center; border-top: 1px solid #f5f5f4;">
                    <p style="margin: 0; color: #78716c; font-size: 12px;">
                      © ${new Date().getFullYear()} Perfect Jodi Matrimony. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}
