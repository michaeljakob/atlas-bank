import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { PaymentRequestEntity, AccountEntity, UserEntity } from '@/database/entities';
import { EmailService } from '@/modules/email/email.service';

@Injectable()
export class PaymentRequestsService {
  private readonly logger = new Logger(PaymentRequestsService.name);

  constructor(
    @InjectRepository(PaymentRequestEntity)
    private readonly requestRepo: Repository<PaymentRequestEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly email: EmailService,
  ) {}

  async create(userId: string, input: {
    amountCents: number;
    currency?: string;
    recipientEmail?: string;
    note?: string;
  }) {
    const token = randomBytes(16).toString('base64url');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const request = this.requestRepo.create({
      userId,
      amountCents: input.amountCents,
      currency: input.currency || 'EUR',
      recipientEmail: input.recipientEmail,
      note: input.note,
      token,
      expiresAt,
    });

    const saved = await this.requestRepo.save(request);

    // Email the payee a pay link when an address was provided. Fire-and-forget
    // so request creation never blocks on email delivery.
    if (input.recipientEmail) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      this.email
        .sendPaymentRequest(input.recipientEmail, {
          requesterName: user ? `${user.firstName} ${user.lastName}`.trim() : 'An Auriga user',
          amount: saved.amountCents,
          currency: saved.currency,
          note: saved.note,
          payLink: `${appUrl}/pay/${saved.token}`,
        })
        .catch((err) => this.logger.warn(`Payment request email failed: ${err.message}`));
    }

    return saved;
  }

  async list(userId: string) {
    return this.requestRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getByToken(token: string) {
    const request = await this.requestRepo.findOne({
      where: { token },
      relations: ['user'],
    });
    if (!request) throw new NotFoundException('Payment request not found');
    return request;
  }

  async markPaid(token: string, paidByName: string) {
    const request = await this.getByToken(token);
    request.status = 'paid';
    request.paidAt = new Date();
    request.paidByName = paidByName;
    return this.requestRepo.save(request);
  }

  async cancel(userId: string, id: string) {
    const request = await this.requestRepo.findOne({ where: { id, userId } });
    if (!request) throw new NotFoundException('Payment request not found');
    request.status = 'cancelled';
    return this.requestRepo.save(request);
  }
}
