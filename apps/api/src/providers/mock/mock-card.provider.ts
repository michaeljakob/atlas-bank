import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CardProvider,
  Card,
  IssueCardInput,
  UpdateCardInput,
  CardSecureDetailsUrl,
  WalletProvisioningData,
} from '@auriga-money/provider-contracts';
import { MockProviderStore } from './mock-store';

/** Dev-only card provider backed by the in-memory mock store. */
@Injectable()
export class MockCardProvider implements CardProvider {
  private readonly logger = new Logger(MockCardProvider.name);

  constructor(private readonly store: MockProviderStore) {}

  async issueCard(input: IssueCardInput): Promise<Card> {
    const id = `mock_card_${randomUUID()}`;
    const now = new Date();
    const card: Card = {
      id,
      providerId: id,
      accountId: input.accountId,
      status: 'active',
      type: input.type,
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      expiryMonth: now.getMonth() + 1,
      expiryYear: now.getFullYear() + 4,
      cardholderName: '',
      createdAt: now.toISOString(),
    };

    this.store.saveCard(card);
    this.logger.warn(`[MOCK] Issued ${input.type} card ${id} (•••• ${card.last4})`);
    return card;
  }

  async getCard(cardId: string): Promise<Card> {
    const card = this.store.getCard(cardId);
    if (!card) throw new Error(`[MOCK] Card ${cardId} not found`);
    return card;
  }

  async listCards(accountId: string): Promise<Card[]> {
    return [];
  }

  async updateCard(input: UpdateCardInput): Promise<Card> {
    let card = this.store.getCard(input.cardId);
    if (!card) {
      card = {
        id: input.cardId,
        providerId: input.cardId,
        accountId: 'unknown',
        status: 'active',
        type: 'virtual',
        last4: '0000',
        expiryMonth: 12,
        expiryYear: new Date().getFullYear() + 3,
        cardholderName: '',
        createdAt: new Date().toISOString(),
      };
      this.logger.warn(`[MOCK] Card ${input.cardId} not in store — created stub`);
    }
    if (input.frozen !== undefined) {
      card.status = input.frozen ? 'frozen' : 'active';
    }
    this.store.saveCard(card);
    return card;
  }

  async cancelCard(cardId: string): Promise<void> {
    const card = this.store.getCard(cardId);
    if (card) {
      card.status = 'cancelled';
      this.store.saveCard(card);
    }
  }

  async getSecureDetailsUrl(cardId: string): Promise<CardSecureDetailsUrl> {
    return {
      url: `https://example.com/mock-card/${cardId}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  }

  async getWalletProvisioningData(
    _cardId: string,
    _walletType: 'apple_pay' | 'google_pay',
  ): Promise<WalletProvisioningData> {
    return {
      activationData: 'mock-activation',
      encryptedPassData: 'mock-pass',
      ephemeralPublicKey: 'mock-key',
    };
  }
}
