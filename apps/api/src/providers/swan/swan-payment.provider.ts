import { Injectable, Logger } from '@nestjs/common';
import {
  PaymentProvider,
  InitiatePaymentInput,
  PaymentConsent,
  PaymentDetails,
  Transaction,
} from '@atlas-bank/provider-contracts';
import { SwanClient } from './swan.client';

@Injectable()
export class SwanPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(SwanPaymentProvider.name);

  constructor(private readonly swan: SwanClient) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<PaymentConsent> {
    const mutation = `
      mutation InitiateTransfer($input: InitiateCreditTransferInput!) {
        initiateCreditTransfer(input: $input) {
          ... on InitiateCreditTransferSuccessPayload {
            payment {
              id
              statusInfo { status }
              consent { consentUrl }
            }
          }
          ... on ForbiddenRejection { message }
          ... on ValidationRejection { message }
        }
      }
    `;

    const variables = {
      input: {
        accountId: input.accountId,
        amount: { value: String(input.amount.amount / 100), currency: 'EUR' },
        targetIban: input.creditorIban,
        targetName: input.creditorName,
        reference: input.reference,
        mode: input.instant ? 'InstantWithFallback' : 'Regular',
      },
    };

    const result = await this.swan.query<any>(mutation, variables);
    const payload = result.initiateCreditTransfer;

    if (payload.__typename !== 'InitiateCreditTransferSuccessPayload') {
      throw new Error(payload.message || 'Failed to initiate payment');
    }

    return {
      id: payload.payment.id,
      consentUrl: payload.payment.consent?.consentUrl || '',
      status: 'pending',
    };
  }

  async getPaymentStatus(consentId: string): Promise<PaymentDetails> {
    const query = `
      query GetPayment($id: ID!) {
        payment(id: $id) {
          id
          statusInfo { status }
          consent { consentUrl status }
          createdAt
          updatedAt
          creditTransfers {
            edges {
              node {
                amount { value currency }
                creditor { name iban }
                debtor { name }
                label
                reference
              }
            }
          }
        }
      }
    `;

    const result = await this.swan.query<any>(query, { id: consentId });
    const payment = result.payment;
    const transfer = payment.creditTransfers?.edges?.[0]?.node;

    return {
      id: payment.id,
      consentUrl: payment.consent?.consentUrl || '',
      consentStatus: this.mapConsentStatus(payment.consent?.status),
      status: payment.statusInfo?.status || 'Initiated',
      amount: transfer?.amount
        ? {
            amount: Math.round(parseFloat(transfer.amount.value) * 100),
            currency: 'EUR',
          }
        : undefined,
      creditorName: transfer?.creditor?.name,
      creditorIban: transfer?.creditor?.iban,
      debtorName: transfer?.debtor?.name,
      reference: transfer?.reference || transfer?.label,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    const query = `
      query GetTransaction($id: ID!) {
        transaction(id: $id) {
          id
          side
          statusInfo { status }
          amount { value currency }
          counterparty
          reference
          bookedAt
          createdAt
        }
      }
    `;

    const result = await this.swan.query<any>(query, { id: transactionId });
    const tx = result.transaction;

    return {
      id: tx.id,
      providerId: tx.id,
      accountId: '',
      direction: tx.side === 'Credit' ? 'inbound' : 'outbound',
      status: tx.statusInfo.status === 'Booked' ? 'settled' : 'pending',
      amount: {
        amount: Math.round(parseFloat(tx.amount.value) * 100),
        currency: 'EUR',
      },
      counterpartyName: tx.counterparty || 'Unknown',
      reference: tx.reference,
      bookedAt: tx.bookedAt,
      createdAt: tx.createdAt,
    };
  }

  private mapConsentStatus(status?: string): PaymentConsent['status'] {
    const map: Record<string, PaymentConsent['status']> = {
      Created: 'pending',
      Accepted: 'accepted',
      Refused: 'refused',
      Expired: 'expired',
    };
    return map[status || ''] || 'pending';
  }
}
