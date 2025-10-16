import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",      //  SendGrid SMTP host
    port: 587,                      //  TLS port
    secure: false,                  // Use TLS, not SSL
    auth: {
      user: "apikey",               // Must be literally "apikey"
      pass: process.env.EMAIL_PASS // Your SendGrid API key
    },
  });

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.VERIFIED_SENDER,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email delivery failed");
  }
};

export default sendEmail;
