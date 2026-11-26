import nodemailer from "nodemailer";

/**
 * Creates and configures Nodemailer transporter using standard Gmail SMTP configuration.
 * Host: smtp.gmail.com | Port: 465 | Secure: true
 * Authenticates using EMAIL_USER and EMAIL_PASS from environment.
 */
export function getEmailTransporter() {
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.EMAIL_USER?.trim() || "perfectjodimatrimony902@gmail.com";
  const pass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error(
      "Email credentials missing. Please ensure EMAIL_USER and EMAIL_PASS are configured in your environment.",
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: true,
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
  const fromEmail = process.env.EMAIL_USER?.trim() || "perfectjodimatrimony902@gmail.com";
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
              <table width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #f2e9dc;">
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

  return await transporter.sendMail(mailOptions);
}

export interface WelcomeEmailData {
  name: string;
  email: string;
  mobile?: string;
  gender?: string;
  createdBy?: string;
  createdAt?: Date | string;
}

/**
 * Sends a greeting and account details confirmation email to the user's own email address
 */
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const transporter = getEmailTransporter();
  const fromEmail = process.env.EMAIL_USER?.trim() || "perfectjodimatrimony902@gmail.com";
  const recipientName = data.name?.trim() || "Valued Member";
  const normalizedTo = data.email.trim().toLowerCase();

  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const genderLabel =
    data.gender === "female"
      ? "Bride (Female)"
      : data.gender === "male"
        ? "Groom (Male)"
        : data.gender || "Not Specified";

  const mailOptions = {
    from: `"Perfect Jodi Matrimony" <${fromEmail}>`,
    to: normalizedTo,
    subject: `Welcome to Perfect Jodi, ${recipientName}! Your Account is Verified 🎉`,
    text: `Congratulations & Welcome, ${recipientName}!\n\nYour matrimonial account on Perfect Jodi has been successfully created and verified.\n\nAccount Details:\n- Full Name: ${recipientName}\n- Email: ${normalizedTo}\n- Mobile: +91 ${data.mobile || "N/A"}\n- Profile For: ${genderLabel}\n- Created By: ${data.createdBy || "Self"}\n- Registration Date: ${formattedDate}\n- Status: Verified Active\n\nNext Step: Complete your matrimonial profile with photos and Horoscope details to get 5x more responses.\n\nWarm regards,\nPerfect Jodi Matrimony Team\nEmail: ${fromEmail}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Perfect Jodi Matrimony</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #fbf7f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fbf7f4; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07); border: 1px solid #ebd9c8;">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #881337 0%, #701a2b 50%, #4c0519 100%); padding: 40px 35px 35px; text-align: center;">
                    <div style="background: rgba(255, 255, 255, 0.12); width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 20px; line-height: 64px; font-size: 30px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.25);">
                      💍
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                      Perfect Jodi
                    </h1>
                    <p style="margin: 8px 0 0; color: #fde047; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      जहाँ रिश्ते बनें खास · Welcome to New Beginnings
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 36px 20px;">
                    <div style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 30px; padding: 6px 14px; margin-bottom: 16px;">
                      <span style="color: #16a34a; font-size: 13px; font-weight: 700;">
                        ✓ Email Verified & Account Active
                      </span>
                    </div>

                    <h2 style="margin: 0 0 14px; color: #1c1917; font-size: 23px; font-weight: 700; line-height: 1.3;">
                      Congratulations, ${recipientName}! 🎉
                    </h2>
                    
                    <p style="margin: 0 0 18px; color: #57534e; font-size: 15px; line-height: 1.6;">
                      We are thrilled to welcome you to <strong>Perfect Jodi Matrimony</strong>. Your registration is complete and your email has been verified successfully.
                    </p>
                    <p style="margin: 0 0 24px; color: #57534e; font-size: 14px; line-height: 1.6;">
                      Here are your registered account details for your reference:
                    </p>

                    <!-- Details Card -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf5ee; border: 1px solid #edd5be; border-radius: 18px; overflow: hidden; margin-bottom: 28px;">
                      <tr>
                        <td style="padding: 16px 20px; background-color: #f3e5d0; border-bottom: 1px solid #e7cdb0;">
                          <strong style="color: #881337; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px;">
                            📋 Your Registration Details
                          </strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 20px;">
                          <table width="100%" border="0" cellspacing="0" cellpadding="6">
                            <tr>
                              <td width="38%" style="color: #78716c; font-size: 13px; font-weight: 500;">Full Name:</td>
                              <td style="color: #1c1917; font-size: 14px; font-weight: 700;">${recipientName}</td>
                            </tr>
                            <tr>
                              <td style="color: #78716c; font-size: 13px; font-weight: 500;">Registered Email:</td>
                              <td style="color: #1c1917; font-size: 14px; font-weight: 600;">${normalizedTo}</td>
                            </tr>
                            <tr>
                              <td style="color: #78716c; font-size: 13px; font-weight: 500;">Mobile Number:</td>
                              <td style="color: #1c1917; font-size: 14px; font-weight: 600;">+91 ${data.mobile || "Provided"}</td>
                            </tr>
                            <tr>
                              <td style="color: #78716c; font-size: 13px; font-weight: 500;">Profile For:</td>
                              <td style="color: #1c1917; font-size: 14px; font-weight: 600;">${genderLabel}</td>
                            </tr>
                            <tr>
                              <td style="color: #78716c; font-size: 13px; font-weight: 500;">Created By:</td>
                              <td style="color: #1c1917; font-size: 14px; font-weight: 600;">${data.createdBy || "Self"}</td>
                            </tr>
                            <tr>
                              <td style="color: #78716c; font-size: 13px; font-weight: 500;">Registered On:</td>
                              <td style="color: #1c1917; font-size: 14px; font-weight: 600;">${formattedDate}</td>
                            </tr>
                            <tr>
                              <td style="color: #78716c; font-size: 13px; font-weight: 500;">Account Status:</td>
                              <td style="color: #16a34a; font-size: 13px; font-weight: 700;">Active & Verified ✓</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 16px; padding: 22px; margin-bottom: 28px;">
                      <h3 style="margin: 0 0 8px; color: #92400e; font-size: 16px; font-weight: 700;">
                        🌟 Next Step: Complete Your Matrimonial Profile
                      </h3>
                      <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.5;">
                        Members with complete biodatas, portrait photos, and Kundali details receive <strong>5x more responses</strong> from genuine brides and grooms.
                      </p>
                    </div>

                    <p style="margin: 0; color: #a8a29e; font-size: 12px; line-height: 1.5; border-top: 1px solid #f5f5f4; padding-top: 20px;">
                      🔒 <strong>Privacy Assurance:</strong> Contact details stay completely private until you accept a connection request. Perfect Jodi never shares your personal data with third parties.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #fafaf9; padding: 24px 35px; text-align: center; border-top: 1px solid #f5f5f4;">
                    <p style="margin: 0 0 6px; color: #57534e; font-size: 13px; font-weight: 600;">
                      Questions or need help? Reach out to our matchmaking team:
                    </p>
                    <p style="margin: 0 0 12px; color: #881337; font-size: 13px; font-weight: 700;">
                      <a href="mailto:${fromEmail}" style="color: #881337; text-decoration: none;">${fromEmail}</a>
                    </p>
                    <p style="margin: 0; color: #a8a29e; font-size: 11px;">
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

  return await transporter.sendMail(mailOptions);
}

export interface AdminAlertData {
  name: string;
  email: string;
  mobile?: string;
  gender?: string;
  dob?: string;
  createdBy?: string;
  createdAt?: Date | string;
  userId?: string;
}

/**
 * Sends newly registered user details to admin email (perfectjodimatrimony902@gmail.com) via Gmail SMTP
 * Non-sensitive details only: NO passwords, NO OTPs, NO tokens.
 */
export async function sendAdminNewUserAlert(data: AdminAlertData) {
  const transporter = getEmailTransporter();
  const adminEmail =
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.EMAIL_USER?.trim() ||
    "perfectjodimatrimony902@gmail.com";
  const fromEmail = process.env.EMAIL_USER?.trim() || "perfectjodimatrimony902@gmail.com";

  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : new Date().toLocaleDateString("en-IN");

  const genderLabel =
    data.gender === "female"
      ? "Bride (Female)"
      : data.gender === "male"
        ? "Groom (Male)"
        : data.gender || "Not Specified";

  const mailOptions = {
    from: `"Perfect Jodi Alerts" <${fromEmail}>`,
    to: adminEmail,
    subject: `🔔 [New User Registration] ${data.name} just registered on Perfect Jodi`,
    text: `New User Registration Alert!\n\nA new member has completed email verification:\n\n- Full Name: ${data.name}\n- Registered Email: ${data.email}\n- Mobile Number: +91 ${data.mobile || "N/A"}\n- Looking For: ${genderLabel}\n- Date of Birth: ${data.dob || "Not Provided"}\n- Profile Created By: ${data.createdBy || "Self"}\n- Registered At: ${formattedDate}\n- Status: Email Verified Active ✓\n\nThis is an automated administrative notification sent from Perfect Jodi Matrimony.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Registration Alert</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e4e4e7;">
                <!-- Admin Header -->
                <tr>
                  <td style="background-color: #18181b; padding: 26px 30px; text-align: left;">
                    <div style="display: inline-block; background-color: #f59e0b; color: #000000; font-size: 11px; font-weight: 800; padding: 3px 9px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                      Admin Notification
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">
                      New Member Registration Alert
                    </h1>
                    <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 13px;">
                      Perfect Jodi Matrimony System
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 30px 30px 24px;">
                    <p style="margin: 0 0 18px; font-size: 15px; color: #27272a; line-height: 1.5;">
                      Hello Admin, a new user has successfully verified their email and registered on <strong>Perfect Jodi</strong>:
                    </p>

                    <!-- Details Table -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 14px; margin-bottom: 24px;">
                      <tr style="border-bottom: 1px solid #f4f4f5;">
                        <td width="38%" style="color: #71717a; font-size: 13px; font-weight: 600;">Full Name:</td>
                        <td style="color: #09090b; font-size: 14px; font-weight: 700;">${data.name}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #f4f4f5;">
                        <td style="color: #71717a; font-size: 13px; font-weight: 600;">Registered Email:</td>
                        <td style="color: #09090b; font-size: 14px; font-weight: 600;">
                          <a href="mailto:${data.email}" style="color: #881337; text-decoration: none; font-weight: 700;">${data.email}</a>
                        </td>
                      </tr>
                      <tr style="border-bottom: 1px solid #f4f4f5;">
                        <td style="color: #71717a; font-size: 13px; font-weight: 600;">Mobile Number:</td>
                        <td style="color: #09090b; font-size: 14px; font-weight: 600;">+91 ${data.mobile || "N/A"}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #f4f4f5;">
                        <td style="color: #71717a; font-size: 13px; font-weight: 600;">Looking For:</td>
                        <td style="color: #09090b; font-size: 14px; font-weight: 600;">${genderLabel}</td>
                      </tr>
                      ${
                        data.dob
                          ? `
                      <tr style="border-bottom: 1px solid #f4f4f5;">
                        <td style="color: #71717a; font-size: 13px; font-weight: 600;">Date of Birth:</td>
                        <td style="color: #09090b; font-size: 14px; font-weight: 600;">${data.dob}</td>
                      </tr>
                      `
                          : ""
                      }
                      <tr style="border-bottom: 1px solid #f4f4f5;">
                        <td style="color: #71717a; font-size: 13px; font-weight: 600;">Profile Created By:</td>
                        <td style="color: #09090b; font-size: 14px; font-weight: 600;">${data.createdBy || "Self"}</td>
                      </tr>
                      <tr style="border-bottom: 1px solid #f4f4f5;">
                        <td style="color: #71717a; font-size: 13px; font-weight: 600;">Registered On:</td>
                        <td style="color: #09090b; font-size: 14px; font-weight: 600;">${formattedDate}</td>
                      </tr>
                      ${
                        data.userId
                          ? `
                      <tr style="border-bottom: 1px solid #f4f4f5;">
                        <td style="color: #71717a; font-size: 13px; font-weight: 600;">Account ID:</td>
                        <td style="color: #71717a; font-size: 13px; font-family: monospace;">${data.userId}</td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="color: #71717a; font-size: 13px; font-weight: 600;">Email Verification:</td>
                        <td style="color: #16a34a; font-size: 13px; font-weight: 700;">Verified Active ✓</td>
                      </tr>
                    </table>

                    <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">
                      Automated administrative alert dispatched via Gmail SMTP to <strong>${adminEmail}</strong>.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f4f4f5; padding: 18px 30px; text-align: center; border-top: 1px solid #e4e4e7;">
                    <p style="margin: 0; color: #71717a; font-size: 12px;">
                      © ${new Date().getFullYear()} Perfect Jodi Matrimony · Admin Dispatch Service
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

  return await transporter.sendMail(mailOptions);
}
