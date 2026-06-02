import { Money, Transaction } from './types';

export interface InitiatePaymentInput {
  accountId: string;
  amount: Money;
  creditorIban: string;
  creditorName: string;
  reference?: string;
  instant?: boolean;
}

export interface PaymentConsent {
  id: string;
  consentUrl: string;
  status: 'pending' | 'accepted' | 'refused' | 'expired';
}

/**
 * Full payment view used to render transfer status/detail screens. `status` is
 * the raw provider payment status (e.g. Swan's `Initiated`, `Booked`).
 */
export interface PaymentDetails {
  id: string;
  consentUrl: string;
  consentStatus: 'pending' | 'accepted' | 'refused' | 'expired';
  status: string;
  amount?: Money;
  creditorName?: string;
  creditorIban?: string;
  debtorName?: string;
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentProvider {
  initiatePayment(input: InitiatePaymentInput): Promise<PaymentConsent>;
  getPaymentStatus(consentId: string): Promise<PaymentDetails>;
  getTransaction(transactionId: string): Promise<Transaction>;
}
