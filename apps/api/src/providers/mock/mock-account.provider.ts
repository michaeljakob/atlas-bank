import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AccountProvider,
  Account,
  Money,
  PaginatedResult,
  Transaction,
  CreateAccountInput,
  ListTransactionsInput,
} from '@auriga-money/provider-contracts';
import { MockProviderStore } from './mock-store';
import { generateMockIban } from './mock-iban';

/** Dev-only account provider backed by the in-memory mock store. */
@Injectable()
export class MockAccountProvider implements AccountProvider {
  private readonly logger = new Logger(MockAccountProvider.name);

  constructor(private readonly store: MockProviderStore) {}

  async createAccount(input: CreateAccountInput): Promise<Account> {
    const details = this.store.getOnboarding(input.onboardingId)?.details;
    const holderName = details
      ? `${details.firstName} ${details.lastName}`.trim()
      : 'Auriga Customer';

    const id = `mock_acc_${randomUUID()}`;
    const account: Account = {
      id,
      providerId: id,
      status: 'active',
      iban: generateMockIban(),
      bic: 'SWNBFR22',
      holderName: holderName || 'Auriga Customer',
      balance: { amount: 0, currency: 'EUR' },
      createdAt: new Date().toISOString(),
    };

    this.store.saveAccount(account);
    this.logger.warn(`[MOCK] Created account ${id} (${account.iban}) for ${holderName}`);
    return account;
  }

  async getAccount(accountId: string): Promise<Account> {
    const account = this.store.getAccount(accountId);
    if (!account) throw new Error(`[MOCK] Account ${accountId} not found`);
    return account;
  }

  async getBalance(accountId: string): Promise<Money> {
    return (await this.getAccount(accountId)).balance;
  }

  async listTransactions(_input: ListTransactionsInput): Promise<PaginatedResult<Transaction>> {
    return { items: [], totalCount: 0, hasNextPage: false };
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    throw new Error(`[MOCK] Transaction ${transactionId} not found`);
  }

  async closeAccount(_accountId: string): Promise<void> {
    // no-op in mock mode
  }
}
