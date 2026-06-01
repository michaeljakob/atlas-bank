export type Currency = 'EUR';

export type KycStatus =
  | 'not_started'
  | 'pending'
  | 'action_required'
  | 'verified'
  | 'rejected';

export type AccountStatus = 'opening' | 'active' | 'suspended' | 'closed';

export type CardStatus =
  | 'processing'
  | 'active'
  | 'frozen'
  | 'cancelled'
  | 'expired';

export type CardType = 'virtual' | 'physical';

export type TransactionStatus = 'pending' | 'settled' | 'rejected' | 'cancelled';

export type TransactionDirection = 'inbound' | 'outbound';

export interface Money {
  amount: number;
  currency: Currency;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  nationality: string;
  residenceCountry: string;
  residenceAddress: Address;
}

export interface Account {
  id: string;
  providerId: string;
  status: AccountStatus;
  iban: string;
  bic: string;
  holderName: string;
  balance: Money;
  createdAt: string;
}

export interface Card {
  id: string;
  providerId: string;
  accountId: string;
  status: CardStatus;
  type: CardType;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  providerId: string;
  accountId: string;
  direction: TransactionDirection;
  status: TransactionStatus;
  amount: Money;
  counterpartyName: string;
  counterpartyIban?: string;
  reference?: string;
  category?: string;
  bookedAt?: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  cursor?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  resourceId: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}
