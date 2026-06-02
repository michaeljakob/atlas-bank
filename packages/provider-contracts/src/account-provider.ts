import { Account, Money, PaginatedResult, Transaction } from './types';

export interface CreateAccountInput {
  onboardingId: string;
  country?: string;
}

export interface ListTransactionsInput {
  accountId: string;
  cursor?: string;
  limit?: number;
  from?: string;
  to?: string;
}

export interface AccountProvider {
  createAccount(input: CreateAccountInput): Promise<Account>;
  getAccount(accountId: string): Promise<Account>;
  getBalance(accountId: string): Promise<Money>;
  listTransactions(input: ListTransactionsInput): Promise<PaginatedResult<Transaction>>;
  /**
   * Fetch a single transaction by its provider id. `accountId` on the result is
   * the provider account id, used to map webhook events back to a local account.
   */
  getTransaction(transactionId: string): Promise<Transaction>;
  closeAccount(accountId: string): Promise<void>;
}
