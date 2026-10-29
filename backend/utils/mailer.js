const nodemailer = require('nodemailer');

// ---------------------------------------------------------------------
// Single shared SMTP transporter, built from env vars so credentials
// never need to be hard-coded. Works out of the box with a Gmail
// "App Password" (2-Step Verification -> App Passwords), or any other
// SMTP provider - just change the env vars, no code changes needed.
// ---------------------------------------------------------------------
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false') === 'true'; // false = STARTTLS on port 587
const SMTP_USER = (process.env.SMTP_USER || '').trim();
// Gmail displays App Passwords grouped in 4s with spaces for readability
// (e.g. "abcd efgh ijkl mnop") but the actual credential has no spaces in
// it - sending it verbatim with spaces silently fails SMTP AUTH on some
// setups. Strip all whitespace defensively so copy-pasting the password
// exactly as Google shows it still works.
const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const SMTP_FROM = process.env.SMTP_FROM || `HERVERSE <${SMTP_USER}>`;

const MAIL_CONFIGURED = !!(SMTP_USER && SMTP_PASS);

let transporter = null;
function getTransporter() {
  if (!MAIL_CONFIGURED) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE, // true for port 465, false for 587 (STARTTLS)
      requireTLS: !SMTP_SECURE, // enforce STARTTLS upgrade on port 587 instead of leaving it optional
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  }
  return transporter;
}

// Verifies the SMTP connection/credentials once at startup so a
// misconfigured mailer shows up clearly in the server logs instead of
// failing silently the first time someone requests an OTP or invoice.
function verifyMailerOnStartup() {
  const tx = getTransporter();
  if (!tx) {
    console.warn('[mailer] SMTP not configured - set SMTP_USER/SMTP_PASS in backend/.env to enable OTP, invoice and report emails.');
    return;
  }
  tx.verify((err) => {
    if (err) console.error('[mailer] SMTP verification FAILED - emails will not send. Reason:', err.message);
    else console.log(`[mailer] SMTP ready - sending as ${SMTP_USER} via ${SMTP_HOST}:${SMTP_PORT}`);
  });
}

// Generic sender. `attachments` follows nodemailer's format:
// [{ filename: 'invoice.pdf', content: Buffer, contentType: 'application/pdf' }]
async function sendMail({ to, subject, html, text, attachments = [] }) {
  const tx = getTransporter();
  if (!tx) {
    console.warn('[mailer] SMTP not configured (SMTP_USER/SMTP_PASS missing) - skipping email:', subject);
    return { skipped: true };
  }
  return tx.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text: text || undefined,
    html,
    attachments
  });
}

function wrapBrandedHtml(title, bodyHtml) {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; background: #FFF7F9; padding: 32px 28px; border-radius: 14px; border: 1px solid #F3D9E3;">
    <h2 style="color:#B23A63; margin:0 0 6px;">HERVERSE</h2>
    <p style="color:#8A6B76; font-size:12px; margin:0 0 22px; letter-spacing:.04em; text-transform:uppercase;">AI-powered women's health tracking</p>
    <h3 style="color:#3A2A30; margin:0 0 14px;">${title}</h3>
    <div style="color:#4A3A40; font-size:14.5px; line-height:1.6;">${bodyHtml}</div>
    <hr style="border:none; border-top:1px solid #F3D9E3; margin:26px 0 14px;" />
    <p style="color:#A98D96; font-size:11.5px;">This is an automated message from HERVERSE. Please don't reply directly to this email.</p>
  </div>`;
}

async function sendOtpEmail(to, otp, name) {
  const html = wrapBrandedHtml(
    'Your password reset code',
    `<p>Hi ${name || 'there'},</p>
     <p>Use the code below to reset your HERVERSE password. It is valid for <b>10 minutes</b>.</p>
     <div style="font-size:32px; font-weight:700; letter-spacing:8px; color:#B23A63; background:#fff; border:1px dashed #E2A9BE; border-radius:10px; padding:16px 0; text-align:center; margin:18px 0;">${otp}</div>
     <p>If you didn't request this, you can safely ignore this email - your password won't be changed.</p>`
  );
  return sendMail({ to, subject: 'HERVERSE — Your password reset code', html });
}

async function sendInvoiceEmail(to, { invoiceNumber, dateStr, label, amountINR, name }, pdfBuffer) {
  const html = wrapBrandedHtml(
    'Payment invoice',
    `<p>Hi ${name || 'there'},</p>
     <p>Thanks for your payment. Here are the details:</p>
     <table style="width:100%; font-size:14px; margin:14px 0;">
       <tr><td style="color:#8A6B76;">Invoice No.</td><td style="text-align:right; font-weight:600;">${invoiceNumber}</td></tr>
       <tr><td style="color:#8A6B76;">Date</td><td style="text-align:right;">${dateStr}</td></tr>
       <tr><td style="color:#8A6B76;">Item</td><td style="text-align:right;">${label}</td></tr>
       <tr><td style="color:#8A6B76;">Amount paid</td><td style="text-align:right; font-weight:700;">₹${amountINR}</td></tr>
     </table>
     <p>Your detailed invoice is attached as a PDF for your records.</p>`
  );
  return sendMail({
    to,
    subject: `HERVERSE — Invoice ${invoiceNumber}`,
    html,
    attachments: [{ filename: `HERVERSE-Invoice-${invoiceNumber}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
  });
}

async function sendReportEmail(to, { dateLabel, name }, pdfBuffer) {
  const html = wrapBrandedHtml(
    'Your daily health report',
    `<p>Hi ${name || 'there'},</p>
     <p>Here's your health report for <b>${dateLabel}</b>, attached as a PDF.</p>`
  );
  return sendMail({
    to,
    subject: `HERVERSE — Daily report for ${dateLabel}`,
    html,
    attachments: [{ filename: `HERVERSE-Report-${dateLabel}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
  });
}

module.exports = { sendMail, sendOtpEmail, sendInvoiceEmail, sendReportEmail, verifyMailerOnStartup, MAIL_CONFIGURED };
