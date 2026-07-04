type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function normalizeRecipients(value: string | undefined) {
  return (value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function buildMailBody(payload: EmailPayload) {
  return {
    from: process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@mart36.vn",
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html ?? payload.text.replace(/\n/g, "<br />"),
  };
}

export async function sendEmail(payload: EmailPayload) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("mailer: SMTP is not configured, skipping email", { to: payload.to, subject: payload.subject });
    return { sent: false, reason: "smtp_not_configured" as const };
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const info = await transporter.sendMail(buildMailBody(payload));
  return { sent: true, messageId: info.messageId };
}

export function getNotificationRecipients() {
  return normalizeRecipients(process.env.NOTIFY_EMAILS || process.env.ADMIN_EMAIL || process.env.SMTP_USER);
}

export function formatOrderConfirmedEmail(params: { orderCode: string; customerName: string; customerEmail: string; totalAmount: number }) {
  return {
    subject: `Don hang ${params.orderCode} da duoc xac nhan`,
    text: [
      `Xin chao ${params.customerName || "quy khach"},`,
      "",
      `Don hang ${params.orderCode} da duoc xac nhan thanh cong.",
      `Tong tien: ${new Intl.NumberFormat("vi-VN").format(params.totalAmount)} VND`,
      "",
      "Cam on ban da mua hang tai Mart36.vn.",
    ].join("\n"),
    to: params.customerEmail,
  };
}

export function formatOrderShippedEmail(params: { orderCode: string; customerName: string; customerEmail: string; trackingCode?: string; carrierName?: string }) {
  return {
    subject: `Don hang ${params.orderCode} da duoc giao`,
    text: [
      `Xin chao ${params.customerName || "quy khach"},`,
      "",
      `Don hang ${params.orderCode} da duoc chuyen sang trang thai giao hang.",
      params.carrierName ? `Don vi van chuyen: ${params.carrierName}` : null,
      params.trackingCode ? `Ma tracking: ${params.trackingCode}` : null,
      "",
      "Cam on ban da mua hang tai Mart36.vn.",
    ].filter(Boolean).join("\n"),
    to: params.customerEmail,
  };
}

export function formatMfaCodeEmail(params: { customerName?: string; email: string; code: string; expiresMinutes: number }) {
  return {
    subject: "Ma xac thuc dang nhap Mart36.vn",
    text: [
      `Xin chao ${params.customerName || "quy khach"},`,
      "",
      `Ma xac thuc cua ban la: ${params.code}`,
      `Ma nay het han sau ${params.expiresMinutes} phut.",
      "Neu ban khong yeu cau dang nhap, vui long bo qua email nay.",
    ].join("\n"),
    to: params.email,
  };
}
