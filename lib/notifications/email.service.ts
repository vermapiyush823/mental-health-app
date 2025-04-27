// Email notification service wrapper around existing Nodemailer setup

import nodemailer from "nodemailer";

export async function sendEmail(email: string, subject: string, message: string): Promise<boolean> {
  if (!process.env.PASS) {
    console.error("SMTP password environment variable is not configured");
    return false;
  }

  if (!email || email.trim() === '') {
    console.error("Email address is required");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    // Verify SMTP connection
    await transporter.verify().catch((error: any) => {
      console.error("SMTP Verification failed:", error);
      throw new Error("Failed to establish SMTP connection");
    });

    const mailOptions = {
      from: `"ReVibe" <${process.env.EMAIL}>`,
      to: email,
      subject: subject,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">
        <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.1);">
          <!-- Header with gradient background -->
          <div style="background: linear-gradient(to right, #6366f1, #8b5cf6); padding: 24px; text-align: center;">
            <h2 style="color: #fff; margin: 0; font-weight: 800; font-size: 28px;">ReVibe<span style="color: #ec4899;">.</span></h2>
          </div>
          
          <div style="padding: 32px 24px; background-color: #fff;">
            <p style="color: #4b5563;">Hello,</p>
            <div style="color: #4b5563; margin: 20px 0; line-height: 1.8;">
              ${message}
            </div>
            
            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #4b5563; margin-bottom: 4px;">Best regards,</p>
              <p style="color: #111827; font-weight: 600; margin-top: 0;">The ReVibe Team</p>
            </div>
            
            <div style="margin-top: 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
          
          <!-- Footer with gradient line -->
          <div style="height: 6px; background: linear-gradient(to right, #6366f1, #8b5cf6, #ec4899);"></div>
        </div>
      </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}