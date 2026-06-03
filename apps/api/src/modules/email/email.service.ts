import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { formatMoney } from '@auriga-money/shared';

const BRAND = {
  neon: '#CCFF00',
  black: '#1C180D',
  green: '#2F8A26',
  textSecondary: '#6F6C68',
  border: '#E4E1DB',
  surface: '#F5F3F0',
  surfaceCard: '#FFFFFF',
  pageBg: '#ECEAE5',
  mutedText: '#9A968F',
  faintText: '#B4B1AB',
} as const;

const FONT_HEADING = `'Martina Plantijn', Georgia, Cambria, 'Times New Roman', serif`;
const FONT_BODY = `'RHPhonic', Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

const LOGO_URL_SUFFIX = '/auriga-lockup-light.svg';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly webUrl: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = new Resend(apiKey || 'test');
    this.fromEmail = `Auriga <noreply@${process.env.RESEND_DOMAIN || 'aurigamoney.com'}>`;
    this.webUrl = (process.env.APP_URL || 'https://aurigamoney.com').replace(/\/$/, '');
  }

  async sendOtp(to: string, code: string) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `${code} is your Auriga verification code`,
        html: this.wrapTemplate(
          `
          ${this.heading('Verify your email')}
          <p style="${this.text()}margin:0 0 24px">Enter this code to verify your email address. It expires in 10&nbsp;minutes.</p>
          <div style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:16px;padding:24px;text-align:center;margin:0 0 24px">
            <span style="font-family:${FONT_BODY};font-size:36px;font-weight:700;letter-spacing:0.22em;color:${BRAND.black}">${code}</span>
          </div>
          <p style="${this.muted()}">If you didn't request this code, you can safely ignore this email.</p>
        `,
          'Your Auriga verification code',
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
        subject: 'Welcome to Auriga',
        html: this.wrapTemplate(
          `
          ${this.heading(`Welcome, ${name}`)}
          <p style="${this.text()}margin:0 0 24px">Your Auriga account is ready. Here's what you can do:</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;width:100%">
            ${this.featureRow('Send & receive', 'Move money across borders with SEPA Instant.')}
            ${this.featureRow('Multi-currency', 'Hold EUR, USD, GBP, and CHF in one place.')}
            ${this.featureRow('Instant card', 'Get a virtual Mastercard in seconds.')}
            ${this.featureRow('Real rates', 'Convert currencies at the mid-market rate.')}
          </table>
          ${this.button('Open Auriga', `${this.webUrl}/app/dashboard`)}
        `,
          'Your Auriga account is ready',
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
  // Building blocks
  // ---------------------------------------------------------------------------

  private text(): string {
    return `font-family:${FONT_BODY};font-size:15px;line-height:1.65;color:${BRAND.textSecondary};`;
  }

  private muted(): string {
    return `font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:${BRAND.mutedText};margin:0;`;
  }

  private heading(label: string): string {
    return `<h1 style="font-family:${FONT_HEADING};font-size:28px;font-weight:500;line-height:1.15;color:${BRAND.black};margin:0 0 16px">${label}</h1>`;
  }

  private button(label: string, href: string): string {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0">
        <tr>
          <td style="border-radius:9999px;background:${BRAND.neon}">
            <a href="${href}" style="display:inline-block;font-family:${FONT_BODY};font-size:15px;font-weight:700;color:${BRAND.black};text-decoration:none;padding:14px 32px;border-radius:9999px">${label}</a>
          </td>
        </tr>
      </table>
    `;
  }

  private amountCard(data: { amount: string; color: string; subtitle?: string; note?: string; footer?: string }): string {
    return `
      <div style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:16px;padding:24px;margin:0 0 24px">
        <p style="font-family:${FONT_BODY};font-size:30px;font-weight:700;line-height:1.1;margin:0;color:${data.color}">${data.amount}</p>
        ${data.subtitle ? `<p style="font-family:${FONT_BODY};font-size:15px;color:${BRAND.textSecondary};margin:8px 0 0">${data.subtitle}</p>` : ''}
        ${data.note ? `<p style="font-family:${FONT_BODY};font-size:13px;color:${BRAND.mutedText};margin:10px 0 0">${data.note}</p>` : ''}
        ${data.footer ? `<p style="font-family:${FONT_BODY};font-size:13px;color:${BRAND.textSecondary};margin:16px 0 0;border-top:1px solid ${BRAND.border};padding-top:16px">${data.footer}</p>` : ''}
      </div>
    `;
  }

  private featureRow(title: string, desc: string): string {
    return `
      <tr>
        <td style="padding:0 0 16px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:top;padding-right:14px">
                <div style="width:8px;height:8px;border-radius:50%;background:${BRAND.neon};margin-top:7px"></div>
              </td>
              <td>
                <p style="font-family:${FONT_BODY};font-size:15px;font-weight:700;color:${BRAND.black};margin:0 0 2px">${title}</p>
                <p style="font-family:${FONT_BODY};font-size:14px;color:${BRAND.textSecondary};margin:0;line-height:1.5">${desc}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  private wrapTemplate(content: string, preheader = ''): string {
    const year = new Date().getFullYear();

    const footerNav = [
      { label: 'Help center', href: `${this.webUrl}/help` },
      { label: 'Terms', href: `${this.webUrl}/terms` },
      { label: 'Privacy', href: `${this.webUrl}/privacy` },
      { label: 'About', href: `${this.webUrl}/about` },
    ]
      .map(
        (l) =>
          `<a href="${l.href}" style="font-family:${FONT_BODY};font-size:12px;color:${BRAND.textSecondary};text-decoration:none">${l.label}</a>`,
      )
      .join(`<span style="color:${BRAND.border};padding:0 8px">&middot;</span>`);

    return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Auriga</title>
  <style>
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0; mso-table-rspace: 0; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 520px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BRAND.pageBg};-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${BRAND.pageBg}">${preheader}${'&zwnj;&nbsp;'.repeat(40)}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.pageBg}">
    <tr>
      <td align="center" style="padding:40px 16px 48px">

        <!--[if mso]><table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="padding:0 0 24px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.black};border-radius:20px 20px 0 0;overflow:hidden">
                <!-- Neon accent stripe -->
                <tr><td style="height:4px;background:${BRAND.neon};font-size:0;line-height:0">&nbsp;</td></tr>
                <tr>
                  <td style="padding:28px 36px" class="email-padding">
                    <a href="${this.webUrl}" style="text-decoration:none">
                      <img src="${this.webUrl}${LOGO_URL_SUFFIX}" alt="Auriga" width="120" height="34" style="display:block;width:120px;height:auto;border:0" />
                    </a>
                  </td>
                </tr>
              </table>

              <!-- ===== CONTENT CARD ===== -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.surfaceCard};border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border}">
                <tr>
                  <td style="padding:36px 36px 40px" class="email-padding">
                    ${content}
                  </td>
                </tr>
              </table>

              <!-- ===== FOOTER ===== -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 20px 20px;overflow:hidden">
                <tr>
                  <td style="padding:28px 36px 24px" class="email-padding">
                    <!-- Footer nav -->
                    <p style="margin:0 0 16px">${footerNav}</p>

                    <!-- Copyright -->
                    <p style="font-family:${FONT_BODY};font-size:11px;color:${BRAND.faintText};margin:0;text-transform:uppercase;letter-spacing:0.06em">&copy; ${year} Auriga Money Technologies Pte. Ltd.</p>
                  </td>
                </tr>
                <!-- Bottom neon accent -->
                <tr><td style="height:4px;background:${BRAND.neon};font-size:0;line-height:0">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
