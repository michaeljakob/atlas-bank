import { Card, CardType } from './types';

export interface IssueCardInput {
  accountId: string;
  type: CardType;
  spendingLimit?: { amount: number; period: 'daily' | 'weekly' | 'monthly' };
  deliveryAddress?: { line1: string; line2?: string; city: string; postalCode: string; country: string };
}

export interface UpdateCardInput {
  cardId: string;
  frozen?: boolean;
  spendingLimit?: { amount: number; period: 'daily' | 'weekly' | 'monthly' } | null;
  onlineEnabled?: boolean;
  contactlessEnabled?: boolean;
}

export interface CardSecureDetailsUrl {
  url: string;
  expiresAt: string;
}

export interface WalletProvisioningData {
  activationData: string;
  encryptedPassData: string;
  ephemeralPublicKey: string;
}

export interface CardProvider {
  issueCard(input: IssueCardInput): Promise<Card>;
  getCard(cardId: string): Promise<Card>;
  listCards(accountId: string): Promise<Card[]>;
  updateCard(input: UpdateCardInput): Promise<Card>;
  cancelCard(cardId: string): Promise<void>;
  getSecureDetailsUrl(cardId: string): Promise<CardSecureDetailsUrl>;
  getWalletProvisioningData(cardId: string, walletType: 'apple_pay' | 'google_pay'): Promise<WalletProvisioningData>;
}
