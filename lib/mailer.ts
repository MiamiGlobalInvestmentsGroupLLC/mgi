import nodemailer from 'nodemailer';

export async function sendOtpEmail(to: string, code: string) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'MGI Bot <no-reply@example.com>';
  if (!host || !user || !pass) {
    console.log('[OTP]', to, code);
    return;
  }
  const transporter = nodemailer.createTransport({ host, port, secure: port===465, auth: { user, pass } });
  await transporter.sendMail({
    from, to, subject: 'Your verification code', text: `Your OTP code is: ${code}`, html: `<p>Your OTP code is: <b>${code}</b></p>`
  });
}
