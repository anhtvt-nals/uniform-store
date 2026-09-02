import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

type CustomerContact = {
  customerName: string;
  phone?: string;
  email?: string;
  region?: string;
  address?: string;
  company?: string;
};

type OrderNotificationItem = {
  productName: string;
  variantName?: string;
  sku?: string;
  sizeName?: string;
  quantity: number;
  unitPrice: number;
  linePrice: number;
};

const escapeHtml = (value: string | number | undefined | null): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatVnd = (value: number): string =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} đ`;

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
    if (!this.transporter) {
      this.logger.warn(
        `Mail transport is not configured; skipped notification: ${options.subject}`,
      );
      return;
    }
    try {
      await this.transporter.sendMail({ from, ...options });
      this.logger.log(`Email notification sent to ${options.to}`);
    } catch (error) {
      // A mail delivery outage must never undo a successfully saved order/request.
      this.logger.error(`Failed to send email notification to ${options.to}`, error);
    }
  }

  async sendQuoteRequestNotification(
    data: CustomerContact & {
      productType: string;
      quantity: number;
      sizeName?: string;
    },
  ): Promise<void> {
    await this.sendInternalNotification({
      eyebrow: 'YÊU CẦU BÁO GIÁ MỚI',
      title: 'Có khách hàng cần tư vấn',
      summary: 'Khách hàng đã gửi yêu cầu báo giá từ website. Hãy liên hệ sớm để tư vấn chính xác.',
      subject: `[Minh An Uniform] Yêu cầu báo giá mới — ${data.customerName}`,
      contact: data,
      detailRows: [
        ['Sản phẩm / nhu cầu', data.productType || 'Chưa cung cấp'],
        ['Số lượng dự kiến', `${data.quantity || 1} sản phẩm`],
        ['Kích thước', data.sizeName || 'Chưa chọn'],
      ],
    });
  }

  async sendOrderNotification(
    data: CustomerContact & {
      code: string;
      createdAt: Date;
      notes?: string;
      total: number;
      items: OrderNotificationItem[];
    },
  ): Promise<void> {
    await this.sendInternalNotification({
      eyebrow: 'ĐƠN ĐẶT HÀNG MỚI',
      title: `Đơn hàng ${data.code}`,
      summary:
        'Khách hàng đã gửi đơn đặt hàng từ website. Thông tin liên hệ và danh sách sản phẩm ở bên dưới.',
      subject: `[Minh An Uniform] Đơn hàng mới ${data.code}`,
      contact: data,
      detailRows: [
        ['Mã đơn hàng', data.code],
        [
          'Thời gian tạo',
          new Intl.DateTimeFormat('vi-VN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Ho_Chi_Minh',
          }).format(data.createdAt),
        ],
        ['Ghi chú / nhu cầu', data.notes || 'Không có'],
      ],
      items: data.items,
      total: data.total,
    });
  }

  private async sendInternalNotification(data: {
    eyebrow: string;
    title: string;
    summary: string;
    subject: string;
    contact: CustomerContact;
    detailRows: Array<[string, string]>;
    items?: OrderNotificationItem[];
    total?: number;
  }): Promise<void> {
    const recipient =
      this.configService.get<string>('app.mail.notificationEmail') || 'minhan.uniform@gmail.com';
    await this.sendMail({
      to: recipient,
      subject: data.subject,
      text: this.createPlainText(data),
      html: this.createNotificationTemplate(data),
    });
  }

  private createNotificationTemplate(data: {
    eyebrow: string;
    title: string;
    summary: string;
    contact: CustomerContact;
    detailRows: Array<[string, string]>;
    items?: OrderNotificationItem[];
    total?: number;
  }): string {
    const contactRows: Array<[string, string]> = [
      ['Khách hàng', data.contact.customerName],
      ['Số điện thoại', data.contact.phone || 'Chưa cung cấp'],
      ['Email', data.contact.email || 'Chưa cung cấp'],
      ['Công ty', data.contact.company || 'Chưa cung cấp'],
      ['Khu vực', data.contact.region || 'Chưa cung cấp'],
      ['Địa chỉ', data.contact.address || 'Chưa cung cấp'],
    ];
    const rows = (entries: Array<[string, string]>) =>
      entries
        .map(
          ([label, value]) => `
      <tr><td style="padding:8px 0;color:#64748b;width:42%;vertical-align:top">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#0f172a;font-weight:600;vertical-align:top">${escapeHtml(value).replace(/\n/g, '<br />')}</td></tr>`,
        )
        .join('');
    const products = data.items?.length
      ? `
      <div style="margin-top:28px"><h2 style="margin:0 0 12px;font-size:16px;color:#0f172a">Sản phẩm yêu cầu</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <thead><tr style="background:#f8fafc;color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.04em"><th align="left" style="padding:12px">Sản phẩm</th><th align="center" style="padding:12px">SL</th><th align="right" style="padding:12px">Thành tiền</th></tr></thead>
      <tbody>${data.items
        .map(
          (item) => `
        <tr><td style="padding:14px 12px;border-top:1px solid #e2e8f0;color:#0f172a"><strong>${escapeHtml(item.productName)}</strong>
        <div style="margin-top:4px;color:#64748b;font-size:13px">${[item.variantName, item.sizeName ? `Size: ${item.sizeName}` : '', item.sku ? `Mã: ${item.sku}` : ''].filter(Boolean).map(escapeHtml).join(' · ')}</div>
        <div style="margin-top:3px;color:#64748b;font-size:13px">${formatVnd(item.unitPrice)} / sản phẩm</div></td>
        <td align="center" style="padding:14px 12px;border-top:1px solid #e2e8f0;color:#0f172a">${item.quantity}</td><td align="right" style="padding:14px 12px;border-top:1px solid #e2e8f0;color:#0f172a;font-weight:700">${formatVnd(item.linePrice)}</td></tr>`,
        )
        .join('')}</tbody></table>
      <div style="text-align:right;margin-top:14px;font-size:16px;color:#0f172a">Tổng dự kiến: <strong style="font-size:20px;color:#d97706">${formatVnd(data.total || 0)}</strong></div></div>`
      : '';

    return `<!doctype html><html lang="vi"><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a"><div style="max-width:680px;margin:0 auto;padding:28px 16px"><div style="overflow:hidden;background:#ffffff;border-radius:20px;box-shadow:0 12px 36px rgba(15,23,42,.10)">
      <div style="padding:30px 32px;background:linear-gradient(135deg,#0f766e,#0f172a);color:#ffffff"><div style="font-size:11px;font-weight:700;letter-spacing:.12em;opacity:.78">${escapeHtml(data.eyebrow)}</div><h1 style="font-size:27px;line-height:1.2;margin:10px 0 8px">${escapeHtml(data.title)}</h1><p style="margin:0;line-height:1.6;color:#e2e8f0">${escapeHtml(data.summary)}</p></div>
      <div style="padding:28px 32px"><h2 style="margin:0 0 10px;font-size:16px;color:#0f172a">Thông tin người liên hệ</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${rows(contactRows)}</table><div style="height:1px;background:#e2e8f0;margin:20px 0"></div><h2 style="margin:0 0 10px;font-size:16px;color:#0f172a">Thông tin yêu cầu</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${rows(data.detailRows)}</table>${products}</div>
      <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.5">Email thông báo tự động từ website Minh An Uniform. Vui lòng liên hệ khách hàng để xác nhận nhu cầu và báo giá.</div>
    </div></div></body></html>`;
  }

  private createPlainText(data: {
    title: string;
    contact: CustomerContact;
    detailRows: Array<[string, string]>;
    items?: OrderNotificationItem[];
    total?: number;
  }): string {
    const contact = [
      ['Khách hàng', data.contact.customerName],
      ['Số điện thoại', data.contact.phone || 'Chưa cung cấp'],
      ['Email', data.contact.email || 'Chưa cung cấp'],
      ['Khu vực', data.contact.region || 'Chưa cung cấp'],
      ['Địa chỉ', data.contact.address || 'Chưa cung cấp'],
    ]
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');
    const details = data.detailRows.map(([label, value]) => `${label}: ${value}`).join('\n');
    const products = data.items
      ?.map(
        (item) =>
          `- ${item.productName}${item.variantName ? ` (${item.variantName})` : ''}${item.sizeName ? `, Size ${item.sizeName}` : ''} × ${item.quantity}: ${formatVnd(item.linePrice)}`,
      )
      .join('\n');
    return [
      data.title,
      '',
      'Thông tin người liên hệ:',
      contact,
      '',
      'Thông tin yêu cầu:',
      details,
      products ? `\nSản phẩm:\n${products}\nTổng dự kiến: ${formatVnd(data.total || 0)}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }
}
