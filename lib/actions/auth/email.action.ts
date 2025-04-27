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
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    // Verify SMTP connection
    await transporter.verify().catch((error:any) => {
      console.error("SMTP Verification failed:", error);
      throw new Error("Failed to establish SMTP connection");
    });

    const mailOptions = {
      from:  `ReVibe" <${process.env.EMAIL}>`, 
      to: email,
      subject: "Your OTP Code for Verification",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">
        <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.1);">
          <!-- Header with gradient background -->
          <div style="background: linear-gradient(to right, #6366f1, #8b5cf6); padding: 24px; text-align: center;">
            <h2 style="color: #fff; margin: 0; font-weight: 800; font-size: 28px;">ReVibe<span style="color: #ec4899;">.</span></h2>
          </div>
          
          <div style="padding: 32px 24px; background-color: #fff;">
            <h3 style="margin-top: 0; text-align: center; font-weight: 500; color: #111827; font-size: 20px;">Verify Your Account</h3>
            
            <p style="color: #4b5563;">Hello,</p>
            <p style="color: #4b5563;">Thank you for choosing ReVibe. Please use the verification code below to complete your request:</p>
            
            <!-- OTP display with styling similar to the sign-in page buttons -->
            <div style="margin: 30px 0; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(to right, #6366f1, #8b5cf6); padding: 2px; border-radius: 12px;">
                <div style="background-color: #fff; border-radius: 10px; padding: 2px;">
                  <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 10px 20px; color: #111827;">${otp}</p>
                </div>
              </div>
            </div>
            
            <p style="color: #4b5563; font-size: 14px;">This code is valid for 1 minute and can only be used once.</p>
            
            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #4b5563; margin-bottom: 4px;">Best regards,</p>
              <p style="color: #111827; font-weight: 600; margin-top: 0;">The ReVibe Team</p>
            </div>
            
            <div style="margin-top: 32px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
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
    return otp;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to send email"
    );
  }
}