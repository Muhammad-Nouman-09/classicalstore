import nodemailer from "nodemailer";
import { formatPrice } from "@/lib/productUtils";

type OrderEmailDetails = {
  customerEmail: string;
  customerName: string;
  orderId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type OrderEmailResult =
  | { skipped: true; reason: string }
  | { skipped: false; reason: null };

type EmailProvider = "smtp" | "resend";

type EmailConfig = {
  fromEmail: string;
  replyTo: string | null;
  preferredProvider: string | null;
  resendApiKey: string | null;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpHost: string | null;
  smtpPort: number;
  smtpSecure: boolean;
  smtpService: string | null;
};

const DISALLOWED_SENDER_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "live.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
]);

function buildOrderConfirmationHtml(details: OrderEmailDetails) {
  const total = details.unitPrice * details.quantity;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#171717;line-height:1.6">
      <h1 style="margin-bottom:8px;">Order confirmed</h1>
      <p>Hi ${details.customerName},</p>
      <p>Thank you for your order with Classical Store. We have received it successfully.</p>
      <div style="margin:24px 0;padding:16px;border:1px solid #e5ddcf;border-radius:16px;background:#fbf8f3">
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> ${details.orderId}</p>
        <p style="margin:0 0 8px;"><strong>Product:</strong> ${details.productName}</p>
        <p style="margin:0 0 8px;"><strong>Quantity:</strong> ${details.quantity}</p>
        <p style="margin:0;"><strong>Total:</strong> ${formatPrice(total)}</p>
      </div>
      <p>We will contact you soon with delivery details.</p>
      <p>Classical Store</p>
    </div>
  `;
}

function buildOrderConfirmationText(details: OrderEmailDetails) {
  const total = details.unitPrice * details.quantity;

  return [
    "Order confirmed",
    `Hi ${details.customerName},`,
    "Thank you for your order with Classical Store. We have received it successfully.",
    `Order ID: ${details.orderId}`,
    `Product: ${details.productName}`,
    `Quantity: ${details.quantity}`,
    `Total: ${formatPrice(total)}`,
    "We will contact you soon with delivery details.",
    "Classical Store",
  ].join("\n");
}

function extractEmailAddress(value: string) {
  const formattedMatch = value.match(/<([^>]+)>/);
  return (formattedMatch?.[1] ?? value).trim().toLowerCase();
}

function getEmailDomain(value: string) {
  const email = extractEmailAddress(value);
  const parts = email.split("@");
  return parts.length === 2 ? parts[1] : null;
}

function parseEmailProviderError(errorText: string) {
  try {
    const parsed = JSON.parse(errorText) as { message?: string };
    return parsed.message ?? errorText;
  } catch {
    return errorText;
  }
}

function isSenderConfigurationError(message: string) {
  return /domain is not verified|verify your domain|sender.+verified|from.+verified/i.test(message);
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) {
    return fallback;
  }

  return /^(1|true|yes|on)$/i.test(value);
}

function resolveDefaultSmtpService(smtpUser: string | null) {
  const smtpUserDomain = smtpUser ? getEmailDomain(smtpUser) : null;
  return smtpUserDomain === "gmail.com" || smtpUserDomain === "googlemail.com" ? "gmail" : null;
}

function getEmailConfig(): EmailConfig {
  const smtpUser = process.env.SMTP_USER?.trim() || null;
  const smtpPort = Number(process.env.SMTP_PORT?.trim() || "587");
  const smtpSecure = parseBoolean(process.env.SMTP_SECURE, smtpPort === 465);

  return {
    fromEmail: process.env.ORDER_CONFIRMATION_FROM_EMAIL?.trim() || smtpUser || "",
    replyTo: process.env.ORDER_CONFIRMATION_REPLY_TO?.trim() || smtpUser || null,
    preferredProvider: process.env.ORDER_EMAIL_PROVIDER?.trim().toLowerCase() || null,
    resendApiKey: process.env.RESEND_API_KEY?.trim() || null,
    smtpUser,
    smtpPass: process.env.SMTP_PASS?.trim() || null,
    smtpHost: process.env.SMTP_HOST?.trim() || null,
    smtpPort: Number.isFinite(smtpPort) ? smtpPort : 587,
    smtpSecure,
    smtpService: process.env.SMTP_SERVICE?.trim() || resolveDefaultSmtpService(smtpUser),
  };
}

function isSmtpConfigured(config: EmailConfig) {
  return Boolean(config.smtpUser && config.smtpPass && (config.smtpService || config.smtpHost));
}

function isResendConfigured(config: EmailConfig) {
  return Boolean(config.resendApiKey);
}

function buildSubject(orderId: string) {
  return `Order confirmation - ${orderId.slice(0, 8)}`;
}

async function sendWithSmtp(details: OrderEmailDetails, config: EmailConfig): Promise<OrderEmailResult> {
  if (!config.fromEmail) {
    return {
      skipped: true,
      reason: "Missing ORDER_CONFIRMATION_FROM_EMAIL or SMTP_USER for SMTP email sending.",
    };
  }

  if (!config.smtpUser || !config.smtpPass) {
    return {
      skipped: true,
      reason: "Missing SMTP_USER or SMTP_PASS for SMTP email sending.",
    };
  }

  if (!config.smtpService && !config.smtpHost) {
    return {
      skipped: true,
      reason: "Missing SMTP_SERVICE or SMTP_HOST for SMTP email sending.",
    };
  }

  const transporter = nodemailer.createTransport(
    config.smtpService
      ? {
          service: config.smtpService,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
          },
        }
      : {
          host: config.smtpHost!,
          port: config.smtpPort,
          secure: config.smtpSecure,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
          },
        }
  );

  await transporter.sendMail({
    from: config.fromEmail,
    to: details.customerEmail,
    replyTo: config.replyTo || undefined,
    subject: buildSubject(details.orderId),
    html: buildOrderConfirmationHtml(details),
    text: buildOrderConfirmationText(details),
  });

  return { skipped: false, reason: null };
}

async function sendWithResend(details: OrderEmailDetails, config: EmailConfig): Promise<OrderEmailResult> {
  if (!config.resendApiKey) {
    return { skipped: true, reason: "Missing RESEND_API_KEY on the server." };
  }

  if (!config.fromEmail) {
    return {
      skipped: true,
      reason: "Missing ORDER_CONFIRMATION_FROM_EMAIL. Use a sender on a domain verified in Resend.",
    };
  }

  const senderDomain = getEmailDomain(config.fromEmail);
  if (senderDomain && DISALLOWED_SENDER_DOMAINS.has(senderDomain)) {
    return {
      skipped: true,
      reason: `ORDER_CONFIRMATION_FROM_EMAIL must use a domain verified in Resend. ${senderDomain} cannot be used as the sender.`,
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.fromEmail,
      to: [details.customerEmail],
      replyTo: config.replyTo || undefined,
      subject: buildSubject(details.orderId),
      html: buildOrderConfirmationHtml(details),
      text: buildOrderConfirmationText(details),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const errorMessage = parseEmailProviderError(errorText);

    if (response.status === 403 && isSenderConfigurationError(errorMessage)) {
      return {
        skipped: true,
        reason: "Order email sender is not verified in Resend. Verify your domain in Resend and update ORDER_CONFIRMATION_FROM_EMAIL.",
      };
    }

    throw new Error(`Failed to send confirmation email: ${errorMessage}`);
  }

  return { skipped: false, reason: null };
}

function resolveProvider(config: EmailConfig): EmailProvider | null {
  if (config.preferredProvider === "smtp") {
    return "smtp";
  }

  if (config.preferredProvider === "resend") {
    return "resend";
  }

  if (isSmtpConfigured(config)) {
    return "smtp";
  }

  if (isResendConfigured(config)) {
    return "resend";
  }

  return null;
}

export async function sendOrderConfirmationEmail(details: OrderEmailDetails): Promise<OrderEmailResult> {
  const config = getEmailConfig();
  const provider = resolveProvider(config);

  if (provider === "smtp") {
    return sendWithSmtp(details, config);
  }

  if (provider === "resend") {
    return sendWithResend(details, config);
  }

  return {
    skipped: true,
    reason: "No email provider is configured. Set SMTP_* variables for Nodemailer or RESEND_API_KEY for Resend.",
  };
}
