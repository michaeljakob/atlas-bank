import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  PaymentProvider,
  PaymentConsent,
  PaymentDetails,
  InitiatePaymentInput,
  Transaction,
} from '@auriga-money/provider-contracts';

/** Dev-only payment provider — auto-accepts transfers without a real bank. */
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(MockPaymentProvider.name);

  async initiatePayment(input: InitiatePaymentInput): Promise<PaymentConsent> {
    const id = `mock_pay_${randomUUID()}`;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    this.logger.warn(`[MOCK] Payment ${id} auto-accepted to ${input.creditorIban}`);
    return {
      id,
      consentUrl: `${appUrl}/app/dashboard`,
      status: 'accepted',
    };
  }

  async getPaymentStatus(consentId: string): Promise<PaymentDetails> {
    return {
      id: consentId,
      consentUrl: '',
      consentStatus: 'accepted',
      status: 'Booked',
    };
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    throw new Error(`[MOCK] Transaction ${transactionId} not found`);
  }
}
