import nodemailer from "nodemailer"

export const sendEmail = async (to, subject, html) => {
  try {
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Email options
    const mailOptions = {
      from: `"Q&A Platform" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    }

    // Send email
    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error("Email sending error:", error)
    throw new Error("Failed to send email")
  }
}
