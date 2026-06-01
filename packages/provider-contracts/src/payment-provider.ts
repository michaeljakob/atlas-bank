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

export interface PaymentProvider {
  initiatePayment(input: InitiatePaymentInput): Promise<PaymentConsent>;
  getPaymentStatus(consentId: string): Promise<PaymentConsent>;
  getTransaction(transactionId: string): Promise<Transaction>;
}
