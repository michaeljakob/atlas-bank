import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { formatMoney, REGULATORY_DISCLOSURE } from '@atlas-bank/shared';

/**
 * Atlas brand tokens, mirrored from apps/web `src/lib/brand.ts`. Kept inline so
 * the API has no dependency on the web package. Update both when the brand
 * palette changes.
 */
const BRAND = {
  neon: '#CCFF00',
  black: '#1C180D',
  green: '#2F8A26',
  textSecondary: '#6F6C68',
  border: '#E4E1DB',
  surface: '#F5F3F0',
  surfaceCard: '#FFFFFF',
  pageBg: '#ECEAE5',
} as const;

// Email clients can't load Martina Plantijn / RHPhonic, so we ship the brand
// fonts with web-safe fallbacks matching the web app's font stacks.
const FONT_HEADING = `'Martina Plantijn', Georgia, Cambria, 'Times New Roman', serif`;
const FONT_BODY = `'RHPhonic', Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly webUrl: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = new Resend(apiKey || 'test');
    this.fromEmail = `Atlas <noreply@${process.env.RESEND_DOMAIN || 'atlasbank.io'}>`;
    this.webUrl = (process.env.APP_URL || 'https://atlasbank.io').replace(/\/$/, '');
  }

  async sendOtp(to: string, code: string) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `${code} is your Atlas verification code`,
        html: this.wrapTemplate(
          `
          ${this.heading('Verify your email')}
          <p style="${this.text()}margin:0 0 20px">Enter this code to verify your email address. It expires in 10 minutes.</p>
          <div style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:14px;padding:20px;text-align:center;margin:0 0 24px">
            <span style="font-family:${FONT_BODY};font-size:34px;font-weight:700;letter-spacing:0.18em;color:${BRAND.black}">${code}</span>
          </div>
          <p style="${this.muted()}">If you didn't request this code, you can safely ignore this email.</p>
        `,
          'Your Atlas verification code',
        ),
      });
      this.logger.log(`OTP sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${to}`, error);
    }
  }

  async sendTransferConfirmation(to: string, data: { amount: number; currency: string; recipientName: string; reference?: string }) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Transfer of ${formatMoney(data.amount, data.currency)} sent`,
        html: this.wrapTemplate(
          `
          ${this.heading('Transfer sent')}
          ${this.amountCard({
            amount: `− ${formatMoney(data.amount, data.currency)}`,
            color: BRAND.black,
            subtitle: `to ${data.recipientName}`,
            note: data.reference,
          })}
          <p style="${this.text()}margin:0">Standard transfers arrive within 1 business day.</p>
        `,
          `You sent ${formatMoney(data.amount, data.currency)} to ${data.recipientName}`,
        ),
      });
    } catch (error) {
      this.logger.error(`Failed to send transfer confirmation to ${to}`, error);
    }
  }

  /**
   * Fires for every incoming payment the moment it settles (Wise-style
   * "you've been paid" alert). Sent from the Swan Transaction.Booked webhook.
   */
  async sendPaymentReceived(
    to: string,
    data: {
      amount: number;
      currency: string;
      senderName: string;
      reference?: string;
      newBalanceCents?: number;
      appUrl?: string;
    },
  ) {
    try {
      const viewLink = `${(data.appUrl || this.webUrl).replace(/\/$/, '')}/app/transactions`;
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `You received ${formatMoney(data.amount, data.currency)} from ${data.senderName}`,
        html: this.wrapTemplate(
          `
          ${this.heading('Money received')}
          ${this.amountCard({
            amount: `+ ${formatMoney(data.amount, data.currency)}`,
            color: BRAND.green,
            subtitle: `from ${data.senderName}`,
            note: data.reference,
            footer:
              typeof data.newBalanceCents === 'number'
                ? `New balance: <strong style="color:${BRAND.black}">${formatMoney(data.newBalanceCents, data.currency)}</strong>`
                : undefined,
          })}
          ${this.button('View transaction', viewLink)}
        `,
          `${data.senderName} sent you ${formatMoney(data.amount, data.currency)}`,
        ),
      });
      this.logger.log(`Payment received email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send payment received email to ${to}`, error);
    }
  }

  async sendPaymentRequest(to: string, data: { requesterName: string; amount: number; currency: string; note?: string; payLink: string }) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `${data.requesterName} requested ${formatMoney(data.amount, data.currency)}`,
        html: this.wrapTemplate(
          `
          ${this.heading('Payment request')}
          <p style="${this.text()}margin:0 0 20px">${data.requesterName} is requesting a payment from you.</p>
          ${this.amountCard({
            amount: formatMoney(data.amount, data.currency),
            color: BRAND.black,
            note: data.note,
          })}
          ${this.button('Review & pay', data.payLink)}
        `,
          `${data.requesterName} requested ${formatMoney(data.amount, data.currency)}`,
        ),
      });
    } catch (error) {
      this.logger.error(`Failed to send payment request to ${to}`, error);
    }
  }

  async sendWelcome(to: string, name: string) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Welcome to Atlas',
        html: this.wrapTemplate(
          `
          ${this.heading(`Welcome, ${name}`)}
          <p style="${this.text()}margin:0 0 20px">Your Atlas account is ready. Here's what you can do:</p>
          <ul style="${this.text()}padding-left:20px;line-height:2;margin:0 0 24px">
            <li>Send and receive money across borders</li>
            <li>Hold multiple currencies (EUR, USD, GBP, CHF)</li>
            <li>Get a virtual or physical debit card</li>
            <li>Convert currencies at the real exchange rate</li>
          </ul>
          ${this.button('Open Atlas', `${this.webUrl}/app/dashboard`)}
        `,
          'Your Atlas account is ready',
        ),
      });
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
    }
  }

  async sendCardAlert(to: string, data: { action: 'frozen' | 'unfrozen'; last4: string }) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Your card ending in ${data.last4} has been ${data.action}`,
        html: this.wrapTemplate(
          `
          ${this.heading(`Card ${data.action}`)}
          <p style="${this.text()}margin:0 0 20px">Your card ending in <strong style="color:${BRAND.black}">${data.last4}</strong> has been ${data.action}.</p>
          <p style="${this.muted()}">If you didn't make this change, please contact support immediately.</p>
        `,
          `Your card ending in ${data.last4} was ${data.action}`,
        ),
      });
    } catch (error) {
      this.logger.error(`Failed to send card alert to ${to}`, error);
    }
  }

  // ---------------------------------------------------------------------------
  // Shared, brand-consistent building blocks
  // ---------------------------------------------------------------------------

  private text(): string {
    return `font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${BRAND.textSecondary};`;
  }

  private muted(): string {
    return `font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:#9A968F;margin:0;`;
  }

  /** Serif display heading, matching the web app's Martina Plantijn headings. */
  private heading(label: string): string {
    return `<h1 style="font-family:${FONT_HEADING};font-size:26px;font-weight:500;line-height:1.2;color:${BRAND.black};margin:0 0 14px">${label}</h1>`;
  }

  /** Neon pill CTA — mirrors the rounded-full brand buttons. */
  private button(label: string, href: string): string {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 0">
        <tr>
          <td style="border-radius:9999px;background:${BRAND.neon}">
            <a href="${href}" style="display:inline-block;font-family:${FONT_BODY};font-size:15px;font-weight:700;color:${BRAND.black};text-decoration:none;padding:13px 30px;border-radius:9999px">${label}</a>
          </td>
        </tr>
      </table>
    `;
  }

  /** Highlighted amount block used across money-movement emails. */
  private amountCard(data: { amount: string; color: string; subtitle?: string; note?: string; footer?: string }): string {
    return `
      <div style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:14px;padding:22px;margin:0 0 24px">
        <p style="font-family:${FONT_BODY};font-size:28px;font-weight:700;line-height:1.1;margin:0;color:${data.color}">${data.amount}</p>
        ${data.subtitle ? `<p style="font-family:${FONT_BODY};font-size:15px;color:${BRAND.textSecondary};margin:6px 0 0">${data.subtitle}</p>` : ''}
        ${data.note ? `<p style="font-family:${FONT_BODY};font-size:13px;color:#9A968F;margin:8px 0 0">${data.note}</p>` : ''}
        ${data.footer ? `<p style="font-family:${FONT_BODY};font-size:13px;color:${BRAND.textSecondary};margin:14px 0 0;border-top:1px solid ${BRAND.border};padding-top:14px">${data.footer}</p>` : ''}
      </div>
    `;
  }

  /**
   * Full branded email document: neon accent, Robin Black header with the Atlas
   * serif wordmark, white content card, and a clear branded footer with links
   * and the regulatory disclosure. Table-based for email-client compatibility.
   */
  private wrapTemplate(content: string, preheader = ''): string {
    const year = new Date().getFullYear();
    const links = [
      { label: 'Help center', href: `${this.webUrl}/help` },
      { label: 'Terms', href: `${this.webUrl}/terms` },
      { label: 'Privacy', href: `${this.webUrl}/privacy` },
    ]
      .map(
        (l) =>
          `<a href="${l.href}" style="font-family:${FONT_BODY};font-size:12px;color:${BRAND.textSecondary};text-decoration:none">${l.label}</a>`,
      )
      .join(`<span style="color:${BRAND.border};padding:0 8px">&middot;</span>`);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Atlas</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.pageBg};-webkit-font-smoothing:antialiased">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${BRAND.pageBg}">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.pageBg}">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;background:${BRAND.surfaceCard};border:1px solid ${BRAND.border};border-radius:18px;overflow:hidden">
          <tr><td style="height:4px;background:${BRAND.neon};font-size:0;line-height:0">&nbsp;</td></tr>
          <tr>
            <td style="background:${BRAND.black};padding:26px 32px">
              <span style="font-family:${FONT_HEADING};font-size:24px;font-weight:500;letter-spacing:0.01em;color:#FFFFFF">Atlas</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:${BRAND.surface};border-top:1px solid ${BRAND.border};padding:24px 32px">
              <p style="margin:0 0 12px">${links}</p>
              <p style="font-family:${FONT_BODY};font-size:11px;line-height:1.6;color:#9A968F;margin:0 0 8px">
                ${REGULATORY_DISCLOSURE} Your funds are safeguarded in dedicated accounts at regulated European credit institutions in accordance with EU e-money regulations. E-money is not covered by a deposit guarantee scheme.
              </p>
              <p style="font-family:${FONT_BODY};font-size:11px;color:#B4B1AB;margin:0;text-transform:uppercase;letter-spacing:0.06em">&copy; ${year} Atlas Financial Technologies Ltd.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
