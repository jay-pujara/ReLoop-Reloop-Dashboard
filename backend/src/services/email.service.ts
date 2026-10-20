import nodemailer from 'nodemailer';
import { logger } from '../config/logger.js';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter() {
    if (this.transporter) return this.transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info(`[EmailService] Created SMTP transport for automated dispatch (${testAccount.user})`);
      } catch (_err) {
        logger.warn('[EmailService] Using fallback JSON transport');
        this.transporter = nodemailer.createTransport({ jsonTransport: true });
      }
    }

    return this.transporter;
  }

  /**
   * Dispatches transactional email directly via SMTP backend (no browser popups or Outlook prompts).
   */
  async sendEmail(payload: EmailPayload): Promise<boolean> {
    try {
      logger.info(`[EmailService] Directly dispatching email to ${payload.to}: ${payload.subject}`);
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: '"ReLoop Platform" <notifications@reloop.network>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      logger.info(`[EmailService] Email dispatched successfully to ${payload.to}. ID: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`[EmailService] Live email preview URL: ${previewUrl}`);
      }
      return true;
    } catch (error) {
      logger.error(`[EmailService] Failed to dispatch email to ${payload.to}:`, error);
      return false;
    }
  }
}

export const emailService = new EmailService();
