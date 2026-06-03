import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentProvider } from '@auriga-money/provider-contracts';
import { AccountEntity, UserEntity } from '@/database/entities';
import { PAYMENT_PROVIDER } from '@/providers/providers.module';
import { isValidIban } from '@auriga-money/shared';
import { EmailService } from '@/modules/email/email.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: PaymentProvider,
    private readonly email: EmailService,
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

    // Notify the user their transfer is on its way. Fire-and-forget — never
    // block the payment response on email delivery.
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      this.email
        .sendTransferConfirmation(user.email, {
          amount: input.amountCents,
          currency: 'EUR',
          recipientName: input.creditorName,
          reference: input.reference,
        })
        .catch((err) => this.logger.warn(`Transfer email failed: ${err.message}`));
    }

    return {
      paymentId: consent.id,
      consentUrl: consent.consentUrl,
      status: consent.status,
    };
  }

  async getPaymentStatus(paymentId: string) {
    return this.paymentProvider.getPaymentStatus(paymentId);
  }

  async getTransferDetails(paymentId: string) {
    const status = await this.paymentProvider.getPaymentStatus(paymentId);
    return {
      id: paymentId,
      status: this.mapProviderStatus(status?.status),
      amountCents: status?.amount?.amount || 0,
      currency: status?.amount?.currency || 'EUR',
      creditorName: status?.creditorName || '',
      creditorIban: status?.creditorIban || '',
      reference: status?.reference,
      createdAt: status?.createdAt || new Date().toISOString(),
      updatedAt: status?.updatedAt || new Date().toISOString(),
    };
  }

  async getPublicTransferStatus(paymentId: string) {
    const status = await this.paymentProvider.getPaymentStatus(paymentId);
    return {
      id: paymentId,
      status: this.mapProviderStatus(status?.status),
      amountCents: status?.amount?.amount || 0,
      currency: status?.amount?.currency || 'EUR',
      creditorName: status?.creditorName || '',
      senderName: status?.debtorName || 'Auriga user',
      reference: status?.reference,
      createdAt: status?.createdAt || new Date().toISOString(),
      updatedAt: status?.updatedAt || new Date().toISOString(),
    };
  }

  private mapProviderStatus(providerStatus?: string): string {
    switch (providerStatus) {
      case 'Initiated':
      case 'ConsentPending':
        return 'initiated';
      case 'Processing':
      case 'Accepted':
        return 'processing';
      case 'Settling':
        return 'in_transit';
      case 'Booked':
      case 'Completed':
        return 'delivered';
      case 'Rejected':
      case 'Canceled':
        return 'failed';
      default:
        return 'initiated';
    }
  }
}
