import { Injectable } from '@nestjs/common';
import { Account, Card, PersonalDetails } from '@auriga-money/provider-contracts';

interface MockOnboardingRecord {
  details: PersonalDetails;
  redirectUrl?: string;
}

/**
 * In-memory store shared across the mock providers so account/card creation can
 * reuse the personal details captured during onboarding. Dev-only — data is lost
 * on restart, which is exactly what we want for local testing.
 */
@Injectable()
export class MockProviderStore {
  private readonly onboardings = new Map<string, MockOnboardingRecord>();
  private readonly accounts = new Map<string, Account>();
  private readonly cards = new Map<string, Card>();

  saveOnboarding(id: string, details: PersonalDetails, redirectUrl?: string) {
    this.onboardings.set(id, { details, redirectUrl });
  }

  getOnboarding(id: string): MockOnboardingRecord | undefined {
    return this.onboardings.get(id);
  }

  saveAccount(account: Account) {
    this.accounts.set(account.id, account);
  }

  getAccount(id: string): Account | undefined {
    return this.accounts.get(id);
  }

  saveCard(card: Card) {
    this.cards.set(card.id, card);
  }

  getCard(id: string): Card | undefined {
    return this.cards.get(id);
  }
}
