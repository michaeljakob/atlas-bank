import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  OnboardingProvider,
  OnboardingSession,
  CreateOnboardingInput,
} from '@atlas-bank/provider-contracts';
import { MockProviderStore } from './mock-store';

/**
 * Dev-only onboarding provider. Auto-approves KYC so the signup funnel can be
 * walked end-to-end without real Swan credentials.
 */
@Injectable()
export class MockOnboardingProvider implements OnboardingProvider {
  private readonly logger = new Logger(MockOnboardingProvider.name);

  constructor(private readonly store: MockProviderStore) {}

  async createOnboarding(input: CreateOnboardingInput): Promise<OnboardingSession> {
    const id = `mock_onb_${randomUUID()}`;
    this.store.saveOnboarding(id, input.details, input.redirectUrl);
    this.logger.warn(`[MOCK] Onboarding ${id} auto-approved for ${input.details.email}`);

    return {
      id,
      providerId: id,
      status: 'verified',
      redirectUrl: input.redirectUrl,
      createdAt: new Date().toISOString(),
    };
  }

  async getOnboardingStatus(onboardingId: string): Promise<OnboardingSession> {
    return {
      id: onboardingId,
      providerId: onboardingId,
      status: 'verified',
      redirectUrl: this.store.getOnboarding(onboardingId)?.redirectUrl,
      createdAt: new Date().toISOString(),
    };
  }

  async getOnboardingUrl(onboardingId: string): Promise<string> {
    return this.store.getOnboarding(onboardingId)?.redirectUrl || '';
  }
}
