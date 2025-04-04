const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shreyasetlur18@gmail.com",
    pass: "uzpqlaqbdtjfklms", // this is your Gmail app password
  },
});

const sendResetEmail = async (recipientEmail, resetToken) => {
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
  
    try {
      const info = await transporter.sendMail({
        from: '"No Reply" <shreyasetlur18@gmail.com>',
        to: recipientEmail,
        subject: "Reset your password",
        html: `
          <p>Hello,</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        `,
      });
  
      console.log("✅ Email sent:", info.response);
    } catch (error) {
      console.error("❌ Failed to send email:", error);
    }
  };  

module.exports = { sendResetEmail };