import { Injectable, Logger } from '@nestjs/common';
import {
  AccountProvider,
  Account,
  Money,
  PaginatedResult,
  Transaction,
  CreateAccountInput,
  ListTransactionsInput,
} from '@atlas-bank/provider-contracts';
import { SwanClient } from './swan.client';

@Injectable()
export class SwanAccountProvider implements AccountProvider {
  private readonly logger = new Logger(SwanAccountProvider.name);

  constructor(private readonly swan: SwanClient) {}

  async createAccount(input: CreateAccountInput): Promise<Account> {
    const query = `
      query GetOnboardingAccount($id: ID!) {
        onboarding(id: $id) {
          account {
            id
            statusInfo { status }
            IBAN
            BIC
            holder { info { ... on AccountHolderIndividualInfo { firstName lastName } } }
            balances { available { value currency } }
            createdAt
          }
        }
      }
    `;

    const result = await this.swan.query<any>(query, { id: input.onboardingId });
    const account = result.onboarding?.account;

    if (!account) {
      throw new Error('Account not yet created by Swan for this onboarding');
    }

    const holderInfo = account.holder?.info;
    const holderName = holderInfo
      ? `${holderInfo.firstName} ${holderInfo.lastName}`
      : '';

    return {
      id: account.id,
      providerId: account.id,
      status: this.mapStatus(account.statusInfo.status),
      iban: account.IBAN,
      bic: account.BIC,
      holderName,
      balance: {
        amount: Math.round(parseFloat(account.balances.available.value) * 100),
        currency: 'EUR',
      },
      createdAt: account.createdAt,
    };
  }

  async getAccount(accountId: string): Promise<Account> {
    const query = `
      query GetAccount($id: ID!) {
        account(id: $id) {
          id
          statusInfo { status }
          IBAN
          BIC
          holder { info { ... on AccountHolderIndividualInfo { firstName lastName } } }
          balances { available { value currency } }
          createdAt
        }
      }
    `;

    const result = await this.swan.query<any>(query, { id: accountId });
    const account = result.account;

    const holderInfo = account.holder?.info;
    const holderName = holderInfo
      ? `${holderInfo.firstName} ${holderInfo.lastName}`
      : '';

    return {
      id: account.id,
      providerId: account.id,
      status: this.mapStatus(account.statusInfo.status),
      iban: account.IBAN,
      bic: account.BIC,
      holderName,
      balance: {
        amount: Math.round(parseFloat(account.balances.available.value) * 100),
        currency: 'EUR',
      },
      createdAt: account.createdAt,
    };
  }

  async getBalance(accountId: string): Promise<Money> {
    const account = await this.getAccount(accountId);
    return account.balance;
  }

  async listTransactions(input: ListTransactionsInput): Promise<PaginatedResult<Transaction>> {
    const query = `
      query ListTransactions($accountId: ID!, $first: Int, $after: String) {
        account(id: $accountId) {
          transactions(first: $first, after: $after, orderBy: { field: createdAt, direction: Desc }) {
            totalCount
            pageInfo { hasNextPage endCursor }
            edges {
              node {
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
          }
        }
      }
    `;

    const result = await this.swan.query<any>(query, {
      accountId: input.accountId,
      first: input.limit || 20,
      after: input.cursor,
    });

    const txData = result.account.transactions;

    return {
      items: txData.edges.map((edge: any) => this.mapTransaction(edge.node, input.accountId)),
      totalCount: txData.totalCount,
      hasNextPage: txData.pageInfo.hasNextPage,
      cursor: txData.pageInfo.endCursor,
    };
  }

  async closeAccount(accountId: string): Promise<void> {
    const mutation = `
      mutation CloseAccount($id: ID!) {
        closeAccount(input: { accountId: $id, reason: "UserRequest" }) {
          ... on CloseAccountSuccessPayload { account { id } }
          ... on ForbiddenRejection { message }
        }
      }
    `;
    await this.swan.query(mutation, { id: accountId });
  }

  private mapStatus(status: string): Account['status'] {
    const map: Record<string, Account['status']> = {
      Opened: 'active',
      Suspended: 'suspended',
      Closing: 'suspended',
      Closed: 'closed',
    };
    return map[status] || 'opening';
  }

  private mapTransaction(node: any, accountId: string): Transaction {
    return {
      id: node.id,
      providerId: node.id,
      accountId,
      direction: node.side === 'Credit' ? 'inbound' : 'outbound',
      status: node.statusInfo.status === 'Booked' ? 'settled' : 'pending',
      amount: {
        amount: Math.round(parseFloat(node.amount.value) * 100),
        currency: 'EUR',
      },
      counterpartyName: node.counterparty || 'Unknown',
      reference: node.reference,
      bookedAt: node.bookedAt,
      createdAt: node.createdAt,
    };
  }
}
