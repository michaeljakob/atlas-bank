import { Injectable, Logger } from '@nestjs/common';
import {
  CardProvider,
  Card,
  IssueCardInput,
  UpdateCardInput,
  CardSecureDetailsUrl,
  WalletProvisioningData,
} from '@atlas-bank/provider-contracts';
import { SwanClient } from './swan.client';

@Injectable()
export class SwanCardProvider implements CardProvider {
  private readonly logger = new Logger(SwanCardProvider.name);

  constructor(private readonly swan: SwanClient) {}

  async issueCard(input: IssueCardInput): Promise<Card> {
    const mutation = `
      mutation AddVirtualCard($input: AddVirtualCardInput!) {
        addVirtualCard(input: $input) {
          ... on AddVirtualCardSuccessPayload {
            card {
              id
              type
              statusInfo { status }
              last4Digits
              expiryDate
              accountMembership { ... on AccountMembership { account { holder { info { ... on AccountHolderIndividualInfo { firstName lastName } } } } } }
              createdAt
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
        name: 'Atlas Card',
        ...(input.spendingLimit && {
          spendingLimit: {
            amount: { value: String(input.spendingLimit.amount / 100), currency: 'EUR' },
            period: input.spendingLimit.period.charAt(0).toUpperCase() + input.spendingLimit.period.slice(1),
          },
        }),
      },
    };

    const result = await this.swan.query<any>(mutation, variables);
    const payload = result.addVirtualCard;

    if (payload.__typename !== 'AddVirtualCardSuccessPayload') {
      throw new Error(payload.message || 'Failed to issue card');
    }

    return this.mapCard(payload.card);
  }

  async getCard(cardId: string): Promise<Card> {
    const query = `
      query GetCard($id: ID!) {
        card(id: $id) {
          id
          type
          statusInfo { status }
          last4Digits
          expiryDate
          createdAt
        }
      }
    `;

    const result = await this.swan.query<any>(query, { id: cardId });
    return this.mapCard(result.card);
  }

  async listCards(accountId: string): Promise<Card[]> {
    const query = `
      query ListCards($accountId: ID!) {
        account(id: $accountId) {
          cards(first: 10) {
            edges {
              node {
                id
                type
                statusInfo { status }
                last4Digits
                expiryDate
                createdAt
              }
            }
          }
        }
      }
    `;

    const result = await this.swan.query<any>(query, { accountId });
    return result.account.cards.edges.map((e: any) => this.mapCard(e.node));
  }

  async updateCard(input: UpdateCardInput): Promise<Card> {
    if (input.frozen !== undefined) {
      const mutation = input.frozen
        ? `mutation { suspendPhysicalCard(input: { cardId: "${input.cardId}" }) { ... on SuspendPhysicalCardSuccessPayload { card { id } } } }`
        : `mutation { resumePhysicalCard(input: { cardId: "${input.cardId}" }) { ... on ResumePhysicalCardSuccessPayload { card { id } } } }`;
      await this.swan.query(mutation);
    }
    return this.getCard(input.cardId);
  }

  async cancelCard(cardId: string): Promise<void> {
    const mutation = `
      mutation CancelCard($id: ID!) {
        cancelCard(input: { cardId: $id }) {
          ... on CancelCardSuccessPayload { card { id } }
          ... on ForbiddenRejection { message }
        }
      }
    `;
    await this.swan.query(mutation, { id: cardId });
  }

  async getSecureDetailsUrl(cardId: string): Promise<CardSecureDetailsUrl> {
    return {
      url: `https://dashboard.swan.io/cards/${cardId}/details`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  }

  async getWalletProvisioningData(
    cardId: string,
    walletType: 'apple_pay' | 'google_pay',
  ): Promise<WalletProvisioningData> {
    const mutation = `
      mutation DigitalizeCard($input: DigitalizeCardInput!) {
        digitalizeCard(input: $input) {
          ... on DigitalizeCardSuccessPayload {
            digitalizationData {
              activationData
              encryptedPassData
              ephemeralPublicKey
            }
          }
          ... on ForbiddenRejection { message }
        }
      }
    `;

    const result = await this.swan.query<any>(mutation, {
      input: { cardId, walletProvider: walletType === 'apple_pay' ? 'ApplePay' : 'GooglePay' },
    });

    const data = result.digitalizeCard.digitalizationData;
    return {
      activationData: data.activationData,
      encryptedPassData: data.encryptedPassData,
      ephemeralPublicKey: data.ephemeralPublicKey,
    };
  }

  private mapCard(node: any): Card {
    const expiry = node.expiryDate ? node.expiryDate.split('/') : ['00', '00'];
    return {
      id: node.id,
      providerId: node.id,
      accountId: '',
      status: this.mapStatus(node.statusInfo?.status),
      type: node.type === 'Virtual' ? 'virtual' : 'physical',
      last4: node.last4Digits || '****',
      expiryMonth: parseInt(expiry[0], 10),
      expiryYear: parseInt(expiry[1], 10),
      cardholderName: '',
      createdAt: node.createdAt,
    };
  }

  private mapStatus(status: string): Card['status'] {
    const map: Record<string, Card['status']> = {
      Processing: 'processing',
      Enabled: 'active',
      Suspended: 'frozen',
      Canceled: 'cancelled',
    };
    return map[status] || 'processing';
  }
}
