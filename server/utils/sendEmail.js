import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {

  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("VERIFIED_SENDER:", process.env.VERIFIED_SENDER);

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", //  Brevo SMTP host
    port: 587,                   //  TLS port
    secure: false,               //  TLS (not SSL)
    auth: {
      user: process.env.SMTP_USER, //  Brevo SMTP login
      pass: process.env.SMTP_PASS, //  Brevo master password
    },
  });

  try {
    await transporter.verify(); // check SMTP connection

    await transporter.sendMail({
      from: process.env.VERIFIED_SENDER, // must be verified in Brevo
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new Error("Email delivery failed");
  }
};

export default sendEmail;