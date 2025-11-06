import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,      // your Gmail address
    pass: process.env.EMAIL_PASS,      // your App Password (not Gmail password)
  },
});

// Function to send confirmation email
export async function sendConfirmationEmail(to: string, name: string) {
  const mailOptions = {
    from: `"LearnifyAI" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to LearnifyAI 🎓",
    html: `
      <div style="font-family: Arial; padding: 20px; background-color: #f9fafb;">
        <h2>Welcome, ${name}!</h2>
        <p>Thanks for signing up on <b>LearnifyAI</b>. Please confirm your email address by clicking the button below:</p>
        <a href="http://localhost:3000/verify?email=${encodeURIComponent(to)}"
           style="display:inline-block; background:#06b6d4; color:#fff; padding:10px 20px; text-decoration:none; border-radius:6px; margin-top:10px;">
           Verify Email
        </a>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <p>— The LearnifyAI Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("✅ Confirmation mail sent to:", to);
}
