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

const LOGO_DATA_URI =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTg1IiBoZWlnaHQ9IjE2NyIgdmlld0JveD0iMCAwIDU4NSAxNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMjEuNDU2IDM3LjAxNkgyNDAuNEwyNzEuMTIgMTEyLjY2NEMyNzMuMTY4IDExNy43ODQgMjc2LjYyNCAxMTkuOTYgMjgxLjg3MiAxMjAuMjE2VjEyN0gyNDEuMjk2VjEyMC4yMTZDMjUwLjI1NiAxMTkuODMyIDI1NC4yMjQgMTE2Ljg4OCAyNTEuMjggMTA5LjU5MkwyNDUuNzc2IDk2LjE1MkgyMTMuNjQ4TDIwOC4yNzIgMTA5LjcyQzIwNS41ODQgMTE2LjYzMiAyMDguOTEyIDExOS44MzIgMjE4Ljg5NiAxMjAuMjE2VjEyN0gxODYuNzY4VjEyMC4yMTZDMTkyLjQgMTE5LjgzMiAxOTUuODU2IDExNy43ODQgMTk4LjE2IDExMi4wMjRMMjI1LjA0IDQ1LjU5MkwyMjEuNDU2IDM3LjAxNlpNMjE2Ljg0OCA4Ny44MzJIMjQyLjMyTDIyOS4zOTIgNTYuMjE2TDIxNi44NDggODcuODMyWk0zNDMuNjEgNjMuODk2VjExMS41MTJDMzQzLjYxIDExNS42MDggMzQ1LjAxOCAxMTcuMDE2IDM0OS4xMTQgMTE4LjA0TDM1MS45MyAxMTguNjhWMTI0LjU2OEwzMjguODkgMTI4LjI4SDMyNi41ODZWMTE3LjUyOEMzMjEuNTk0IDEyMi42NDggMzE1LjE5NCAxMjguMjggMzA2Ljc0NiAxMjguMjhDMjk2LjUwNiAxMjguMjggMjg5LjU5NCAxMjEuMTEyIDI4OS41OTQgMTEwLjEwNFY4MC40MDhDMjg5LjU5NCA3NS40MTYgMjg3LjgwMiA3My40OTYgMjgxLjUzIDcyLjcyOFY2Ni4yTDMwNi43NDYgNjMuODk2VjEwNS4xMTJDMzA2Ljc0NiAxMTMuMTc2IDMxMC4yMDIgMTE2Ljc2IDMxNi40NzQgMTE2Ljc2QzMyMC4wNTggMTE2Ljc2IDMyNC4wMjYgMTE1LjIyNCAzMjYuNDU4IDExMy4wNDhWODAuNDA4QzMyNi40NTggNzUuNDE2IDMyNC42NjYgNzMuNDk2IDMxOC4zOTQgNzIuNzI4VjY2LjJMMzQzLjYxIDYzLjg5NlpNMzkzLjk0NSAxMjAuNlYxMjdIMzU3LjIwOVYxMjAuNkMzNjIuOTY5IDEyMC4yMTYgMzY1LjY1NyAxMTguNDI0IDM2NS42NTcgMTE0LjA3MlY4MC43OTJMMzU2Ljk1MyA3NC42NDhWNzEuMDY0TDM4MC42MzMgNjIuNjE2SDM4Mi44MDlWNzYuNTY4QzM4OC4zMTMgNjkuNCAzOTMuNTYxIDYyLjYxNiA0MDAuODU3IDYyLjYxNkM0MDcuODk3IDYyLjYxNiA0MTEuMjI1IDY5LjY1NiA0MTEuMzUzIDc2LjE4NEw0MDAuMDg5IDgzLjczNkgzOTcuNTI5QzM5NS45OTMgNzkuNTEyIDM5NC4yMDEgNzYuNjk2IDM5MC40ODkgNzYuNjk2QzM4Ny44MDEgNzYuNjk2IDM4NS42MjUgNzguMjMyIDM4Mi44MDkgODAuNzkyVjExNC4wNzJDMzgyLjgwOSAxMTguNDI0IDM4NS4zNjkgMTIwLjIxNiAzOTMuOTQ1IDEyMC42Wk00MzIuMzU4IDU0LjI5NkM0MjYuNDcgNTQuMjk2IDQyMS43MzQgNDkuNDMyIDQyMS43MzQgNDMuNTQ0QzQyMS43MzQgMzcuNjU2IDQyNi40NyAzMi45MiA0MzIuMzU4IDMyLjkyQzQzOC4zNzQgMzIuOTIgNDQzLjExIDM3LjY1NiA0NDMuMTEgNDMuNTQ0QzQ0My4xMSA0OS40MzIgNDM4LjM3NCA1NC4yOTYgNDMyLjM1OCA1NC4yOTZaTTQ0MC45MzQgMTE0LjA3MkM0NDAuOTM0IDExOC40MjQgNDQzLjc1IDEyMC4yMTYgNDQ5LjUxIDEyMC42VjEyN0g0MTUuMzM0VjEyMC42QzQyMS4wOTQgMTIwLjIxNiA0MjMuNzgyIDExOC40MjQgNDIzLjc4MiAxMTQuMDcyVjgwLjc5Mkw0MTUuMDc4IDc0LjY0OFY3MS4wNjRMNDM4Ljc1OCA2Mi42MTZINDQwLjkzNFYxMTQuMDcyWk00ODEuODUxIDEwNS40OTZDNDc4Ljc3OSAxMDUuNDk2IDQ3NS44MzUgMTA1LjExMiA0NzMuMDE5IDEwNC40NzJDNDcwLjMzMSAxMDYuNzc2IDQ2OS4xNzkgMTA5LjA4IDQ2OS4xNzkgMTExQzQ2OS4xNzkgMTEzLjU2IDQ3MS4zNTUgMTE0LjQ1NiA0NzUuOTYzIDExNC40NTZINDk5LjEzMUM1MTAuNTIzIDExNC40NTYgNTE3Ljk0NyAxMjAuMjE2IDUxNy45NDcgMTI5LjgxNkM1MTcuOTQ3IDE0NS44MTYgNDk5LjY0MyAxNTcuNzIgNDc3Ljc1NSAxNTcuNzJDNDYyLjI2NyAxNTcuNzIgNDUwLjEwNyAxNTIuMzQ0IDQ1MC4xMDcgMTQyLjYxNkM0NTAuMTA3IDEzNS44MzIgNDU2Ljc2MyAxMzEuMjI0IDQ2NS41OTUgMTI4LjkyQzQ2MC4yMTkgMTI3LjI1NiA0NTYuNTA3IDEyMy4xNiA0NTYuNTA3IDExOC4xNjhDNDU2LjUwNyAxMTIuNDA4IDQ2Mi4yNjcgMTA3LjI4OCA0NjkuMDUxIDEwMy4xOTJDNDYwLjYwMyA5OS45OTIgNDU1LjA5OSA5My40NjQgNDU1LjA5OSA4NS4xNDRDNDU1LjA5OSA3MS43MDQgNDY3Ljg5OSA2Mi42MTYgNDgxLjk3OSA2Mi42MTZDNDg3Ljg2NyA2Mi42MTYgNDkzLjExNSA2My44OTYgNDk3LjMzOSA2Ni4wNzJINTE4Ljg0M1Y3NC45MDRINTA2LjY4M0M1MDcuODM1IDc3LjIwOCA1MDguNDc1IDc5LjY0IDUwOC40NzUgODIuMkM1MDguNDc1IDk2LjAyNCA0OTYuMzE1IDEwNS40OTYgNDgxLjg1MSAxMDUuNDk2Wk00ODMuMjU5IDk5LjYwOEM0ODkuMjc1IDk5LjYwOCA0OTIuMjE5IDkzLjQ2NCA0OTIuMjE5IDg1LjE0NEM0OTIuMjE5IDc2LjU2OCA0ODguMzc5IDY4LjI0OCA0ODEuMjExIDY4LjI0OEM0NzUuMzIzIDY4LjI0OCA0NzIuMzc5IDc0LjI2NCA0NzIuMzc5IDgyLjU4NEM0NzIuMzc5IDkxLjQxNiA0NzYuMzQ3IDk5LjYwOCA0ODMuMjU5IDk5LjYwOFpNNDY0Ljk1NSAxMzguNjQ4QzQ2NC45NTUgMTQ2LjQ1NiA0NzIuNTA3IDE1MC4xNjggNDgxLjk3OSAxNTAuMTY4QzQ5NC41MjMgMTUwLjE2OCA1MDMuMDk5IDE0NC4yOCA1MDMuMDk5IDEzNy4zNjhDNTAzLjA5OSAxMzEuNzM2IDQ5OC40OTEgMTI5LjY4OCA0OTEuNzA3IDEyOS42ODhINDY5LjMwN0M0NjYuMjM1IDEzMi4yNDggNDY0Ljk1NSAxMzUuNDQ4IDQ2NC45NTUgMTM4LjY0OFpNNTc4LjI2MSAxMTcuNEM1ODAuMDUzIDExNy40IDU4MS43MTcgMTE2Ljc2IDU4Mi45OTcgMTE1Ljk5Mkw1ODQuNzg5IDEyMC43MjhDNTgxLjcxNyAxMjQuNTY4IDU3NS43MDEgMTI4LjI4IDU3MC4zMjUgMTI4LjI4QzU2NC4xODEgMTI4LjI4IDU1OS4zMTcgMTI0LjY5NiA1NTcuMzk3IDExOC45MzZDNTUzLjY4NSAxMjIuNzc2IDU0Ni45MDEgMTI3Ljg5NiA1MzkuMDkzIDEyNy44OTZDNTMwLjAwNSAxMjcuODk2IDUyMi43MDkgMTIyLjEzNiA1MjIuNzA5IDExMy4zMDRDNTIyLjcwOSAxMDMuMTkyIDUzMC42NDUgOTcuOTQ0IDU0Mi41NDkgOTQuMTA0TDU1Ny4wMTMgODkuMjRWODEuNDMyQzU1Ny4wMTMgNzQuMzkyIDU1My41NTcgNjkuOTEyIDU0Ni45MDEgNjkuOTEyQzU0My4wNjEgNjkuOTEyIDU0MS4wMTMgNzIuNiA1NDEuMDEzIDc2LjA1NkM1NDEuMDEzIDc4Ljc0NCA1NDIuMDM3IDgxLjMwNCA1NDMuNzAxIDg0LjI0OEw1MjkuNzQ5IDg3LjcwNEM1MjcuMDYxIDg2LjkzNiA1MjQuNjI5IDg0Ljc2IDUyNC42MjkgODEuNDMyQzUyNC42MjkgNzIuMDg4IDUzOS4zNDkgNjIuNjE2IDU1NC43MDkgNjIuNjE2QzU2Ny4zODEgNjIuNjE2IDU3My42NTMgNjguMjQ4IDU3My42NTMgNzkuMzg0VjExMi43OTJDNTczLjY1MyAxMTUuOTkyIDU3NS44MjkgMTE3LjQgNTc4LjI2MSAxMTcuNFpNNTM5LjQ3NyAxMDguODI0QzUzOS40NzcgMTEzLjgxNiA1NDMuNzAxIDExNy4yNzIgNTQ5LjIwNSAxMTcuMjcyQzU1MS42MzcgMTE3LjI3MiA1NTUuMDkzIDExNi42MzIgNTU3LjAxMyAxMTUuMjI0Vjk2LjAyNEM1NDYuMzg5IDk5LjM1MiA1MzkuNDc3IDEwMS41MjggNTM5LjQ3NyAxMDguODI0WiIgZmlsbD0iI0ZGRkZGRiIvPgo8bWFzayBpZD0iYXVyaWdhLWN1dC1saWdodCIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjE2OCIgaGVpZ2h0PSIxNjciPgo8Y2lyY2xlIGN4PSI4My41Mjk4IiBjeT0iMzUiIHI9IjM1IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIxMzMiIGN5PSI4NCIgcj0iMzUiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9Ijg0IiBjeT0iMTMyIiByPSIzNSIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMzUiIGN5PSI4NCIgcj0iMzUiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjgzLjA4MzMiIHk9IjM3IiB3aWR0aD0iNjgiIGhlaWdodD0iNjgiIHJ4PSIxNSIgdHJhbnNmb3JtPSJyb3RhdGUoNDUgODMuMDgzMyAzNykiIGZpbGw9ImJsYWNrIi8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNhdXJpZ2EtY3V0LWxpZ2h0KSI+CjxjaXJjbGUgY3g9Ijg0IiBjeT0iMTMyIiByPSIzNSIgZmlsbD0iI0ZGRkZGRiIvPgo8Y2lyY2xlIGN4PSIzNSIgY3k9Ijg0IiByPSIzNSIgZmlsbD0iI0ZGRkZGRiIvPgo8L2c+Cjwvc3ZnPgo=';

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
          <div style="background:${BRAND.surfaceCard};border:1px solid ${BRAND.border};border-radius:16px;padding:24px;text-align:center;margin:0 0 24px">
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
                      <img src="${LOGO_DATA_URI}" alt="Auriga" width="120" height="34" style="display:block;width:120px;height:auto;border:0" />
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
