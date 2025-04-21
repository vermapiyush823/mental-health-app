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
        user: "vermapiyush823@gmail.com",
        pass: process.env.PASS,
      },
    });

    // Verify SMTP connection
    await transporter.verify().catch((error: any) => {
      console.error("SMTP Verification failed:", error);
      throw new Error("Failed to establish SMTP connection");
    });

    const mailOptions = {
      from: `"Mental Health App" <${process.env.EMAIL || "vermapiyush823@gmail.com"}>`,
      to: email,
      subject: subject,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #000; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: #fff; margin: 0;">Mental Health App</h2>
        </div>
        <div style="padding: 20px; background-color: #fff; border-radius: 0 0 8px 8px;">
          <p style="color: #555;">Hello,</p>
          <p style="color: #555;">${message}</p>
          <p style="margin-top: 20px; color: #555;">Best Regards,</p>
          <p style="font-weight: bold; color: #000;">Mental Health App Team</p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">This is an automated message. Please do not reply to this email.</p>
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