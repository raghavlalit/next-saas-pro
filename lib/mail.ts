import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  console.log({ resetLink });
  await transporter.sendMail({
    from: `"NextSaaS Pro" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your password',
    html: `
      <p>Hello,</p>
      <p>You requested to reset your password.</p>
      <p>
        <a href="${resetLink}">Click here to reset your password</a>
      </p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
}
