import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuoteRequestEntity, UserEntity } from '@app/database';
import { MailService } from '@app/shared';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';

@Injectable()
export class QuoteRequestsService {
  constructor(
    @InjectRepository(QuoteRequestEntity)
    private readonly quoteRequestRepo: Repository<QuoteRequestEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateQuoteRequestDto) {
    await this.syncCustomer(dto.customerName, dto.email ?? '', dto.phone);
    const quoteRequest = this.quoteRequestRepo.create({
      customerName: dto.customerName,
      phone: dto.phone,
      email: dto.email ?? '',
      region: dto.region ?? '',
      address: dto.address ?? '',
      productType: dto.productType ?? '',
      quantity: dto.quantity ?? 1,
      source: dto.source ?? '',
      status: 'NEW',
    });

    const saved = await this.quoteRequestRepo.save(quoteRequest);

    await this.mailService.sendQuoteRequestNotification({
      customerName: saved.customerName,
      phone: saved.phone,
      email: saved.email,
      region: saved.region,
      address: saved.address,
      productType: saved.productType,
      quantity: saved.quantity,
    });

    return saved;
  }

  private async syncCustomer(fullName: string, email: string, phone: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.replace(/[\s.()-]/g, '');
    if (!normalizedEmail && !normalizedPhone) return;
    const existing = await this.userRepo
      .createQueryBuilder('user')
      .where(normalizedEmail ? 'LOWER(user.email) = :email' : '1 = 0', { email: normalizedEmail })
      .orWhere(normalizedPhone ? 'user.phone = :phone' : '1 = 0', { phone: normalizedPhone })
      .getOne();
    const [firstName = '', ...lastNameParts] = fullName.trim().split(/\s+/);
    if (existing) {
      existing.firstName = firstName || existing.firstName;
      existing.lastName = lastNameParts.join(' ') || existing.lastName;
      existing.phone = normalizedPhone || existing.phone;
      await this.userRepo.save(existing);
      return;
    }
    if (!normalizedEmail) return;
    await this.userRepo.save(this.userRepo.create({
      id: crypto.randomUUID(), email: normalizedEmail, firstName,
      lastName: lastNameParts.join(' '), phone: normalizedPhone, isActive: true,
    }));
  }
}
