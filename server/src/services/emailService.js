import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async ({
  email,
  fullName,
  resetToken,
}) => {
  const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const resetUrl = `${frontendUrl}/member/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"YIZ-AMS" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "YIZ-AMS Password Reset",
    text: `Hello ${fullName},

We received a request to reset your YIZ-AMS member account password.

Use the following link to reset your password:

${resetUrl}

This link will expire in ${process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15} minutes.

If you did not request a password reset, you can safely ignore this email.

YIZ-AMS`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>YIZ-AMS Password Reset</h2>

        <p>Hello ${fullName},</p>

        <p>
          We received a request to reset your YIZ-AMS member
          account password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#2563eb;
              color:#ffffff;
              text-decoration:none;
              border-radius:6px;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link will expire in
          ${process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15}
          minutes.
        </p>

        <p>
          If you did not request a password reset, you can safely
          ignore this email.
        </p>

        <p>YIZ-AMS</p>
      </div>
    `,
  });
};