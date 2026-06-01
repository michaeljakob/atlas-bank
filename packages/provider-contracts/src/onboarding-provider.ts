import { KycStatus, PersonalDetails } from './types';

export interface OnboardingSession {
  id: string;
  providerId: string;
  status: KycStatus;
  redirectUrl?: string;
  createdAt: string;
}

export interface CreateOnboardingInput {
  details: PersonalDetails;
  redirectUrl: string;
  language?: string;
}

export interface OnboardingProvider {
  createOnboarding(input: CreateOnboardingInput): Promise<OnboardingSession>;
  getOnboardingStatus(onboardingId: string): Promise<OnboardingSession>;
  getOnboardingUrl(onboardingId: string): Promise<string>;
}
