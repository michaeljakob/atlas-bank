import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentProvider } from '@atlas-bank/provider-contracts';
import { AccountEntity } from '@/database/entities';
import { PAYMENT_PROVIDER } from '@/providers/providers.module';
import { isValidIban } from '@atlas-bank/shared';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: PaymentProvider,
  ) {}

  async initiateTransfer(
    userId: string,
    input: { creditorIban: string; creditorName: string; amountCents: number; reference?: string; instant?: boolean },
  ) {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

    if (!isValidIban(input.creditorIban)) {
      throw new BadRequestException('Invalid IBAN');
    }

    if (input.amountCents <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const consent = await this.paymentProvider.initiatePayment({
      accountId: account.providerAccountId,
      amount: { amount: input.amountCents, currency: 'EUR' },
      creditorIban: input.creditorIban,
      creditorName: input.creditorName,
      reference: input.reference,
      instant: input.instant,
    });

    return {
      paymentId: consent.id,
      consentUrl: consent.consentUrl,
      status: consent.status,
    };
  }

  async getPaymentStatus(paymentId: string) {
    return this.paymentProvider.getPaymentStatus(paymentId);
  }
}
