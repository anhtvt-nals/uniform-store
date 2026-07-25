import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('app.mail.host');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('app.mail.port') || 587,
        secure: this.configService.get<boolean>('app.mail.secure') || false,
        auth: {
          user: this.configService.get<string>('app.mail.user'),
          pass: this.configService.get<string>('app.mail.password'),
        },
      });
    }
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    const from = this.configService.get<string>('app.mail.from') || 'noreply@minhanuniform.vn';
    const salesEmail = this.configService.get<string>('app.mail.salesEmail');

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, ...options });
        this.logger.log(`Email sent to ${options.to}`);
      } catch (err) {
        this.logger.error(`Failed to send email to ${options.to}`, err);
      }
    } else {
      this.logger.warn('Mail transport not configured — logging email content');
      this.logger.log(`--- EMAIL TO: ${options.to} ---`);
      this.logger.log(`Subject: ${options.subject}`);
      this.logger.log(`Body: ${options.text || options.html}`);
      this.logger.log('--- END EMAIL ---');
    }
  }

  async sendQuoteRequestNotification(data: {
    customerName: string;
    phone: string;
    email: string;
    region: string;
    address: string;
    productType: string;
    quantity: number;
  }): Promise<void> {
    const salesEmail = this.configService.get<string>('app.mail.salesEmail') || 'sales@minhanuniform.vn';

    const text = `
New Quote Request From Website

Customer information:
Name: ${data.customerName}
Phone: ${data.phone}
Email: ${data.email || 'N/A'}
Region: ${data.region || 'N/A'}
Address: ${data.address || 'N/A'}
Product: ${data.productType || 'N/A'}
Quantity: ${data.quantity}

Please contact this customer as soon as possible.
    `.trim();

    await this.sendMail({
      to: salesEmail,
      subject: 'New Quote Request From Website',
      text,
    });
  }
}
