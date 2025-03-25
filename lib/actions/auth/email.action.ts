import nodemailer from "nodemailer";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendEmail(email: string): Promise<string> {
  if (!process.env.PASS) {
    throw new Error("SMTP password environment variable is not configured");
  }

  try {
    const otp = generateOTP();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vermapiyush823@gmail.com",
        pass: process.env.PASS,
      },
    });

    // Verify SMTP connection
    await transporter.verify().catch((error:any) => {
      console.error("SMTP Verification failed:", error);
      throw new Error("Failed to establish SMTP connection");
    });

    const mailOptions = {
      from:  `"Mental Health App" <${process.env.EMAIL}>`, 
      to: email,
      subject: "Your OTP Code for Verification",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #000; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: #fff; margin: 0;">Mental Health App</h2>
        </div>
        <div style="padding: 20px; background-color: #fff; border-radius: 0 0 8px 8px;">
          <p style="color: #555;">Dear Customer,</p>
          <p style="color: #555;">We are delighted to have you with us! To proceed with your request, please use the following OTP for verification:</p>
          <p style="font-size: 28px; font-weight: bold; color: #000; text-align: center; margin: 20px 0;">${otp}</p>
          <p style="color: #555;">This OTP is valid for the next 1 minute. Please do not share it with anyone.</p>
          <p style="color: #555;">If you have any questions or concerns, feel free to contact us.</p>
          <p style="margin-top: 20px; color: #555;">Best Regards,</p>
          <p style="font-weight: bold; color: #000;">Mental Health App Team</p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return otp;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to send email"
    );
  }
}