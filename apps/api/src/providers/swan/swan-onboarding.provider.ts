import { Injectable, Logger } from '@nestjs/common';
import {
  OnboardingProvider,
  OnboardingSession,
  CreateOnboardingInput,
} from '@atlas-bank/provider-contracts';
import { SwanClient } from './swan.client';

@Injectable()
export class SwanOnboardingProvider implements OnboardingProvider {
  private readonly logger = new Logger(SwanOnboardingProvider.name);

  constructor(private readonly swan: SwanClient) {}

  async createOnboarding(input: CreateOnboardingInput): Promise<OnboardingSession> {
    const mutation = `
      mutation CreateOnboarding($input: OnboardingInput!) {
        createOnboarding(input: $input) {
          ... on CreateOnboardingSuccessPayload {
            onboarding {
              id
              statusInfo { status }
              onboardingUrl
              createdAt
            }
          }
          ... on ForbiddenRejection { message }
          ... on ValidationRejection { message fields { path message } }
        }
      }
    `;

    const variables = {
      input: {
        type: 'Individual',
        email: input.details.email,
        firstName: input.details.firstName,
        lastName: input.details.lastName,
        birthDate: input.details.dateOfBirth,
        nationality: input.details.nationality,
        residencyAddress: {
          addressLine1: input.details.residenceAddress.line1,
          addressLine2: input.details.residenceAddress.line2,
          city: input.details.residenceAddress.city,
          postalCode: input.details.residenceAddress.postalCode,
          country: input.details.residenceAddress.country,
        },
        language: input.language || 'en',
        redirectUrl: input.redirectUrl,
      },
    };

    const result = await this.swan.query<any>(mutation, variables);
    const payload = result.createOnboarding;

    if (payload.__typename !== 'CreateOnboardingSuccessPayload') {
      this.logger.error(`Swan onboarding creation failed: ${payload.message}`);
      throw new Error(payload.message || 'Failed to create onboarding');
    }

    const onboarding = payload.onboarding;
    return {
      id: onboarding.id,
      providerId: onboarding.id,
      status: this.mapStatus(onboarding.statusInfo.status),
      redirectUrl: onboarding.onboardingUrl,
      createdAt: onboarding.createdAt,
    };
  }

  async getOnboardingStatus(onboardingId: string): Promise<OnboardingSession> {
    const query = `
      query GetOnboarding($id: ID!) {
        onboarding(id: $id) {
          id
          statusInfo { status }
          onboardingUrl
          createdAt
        }
      }
    `;

    const result = await this.swan.query<any>(query, { id: onboardingId });
    const onboarding = result.onboarding;

    return {
      id: onboarding.id,
      providerId: onboarding.id,
      status: this.mapStatus(onboarding.statusInfo.status),
      redirectUrl: onboarding.onboardingUrl,
      createdAt: onboarding.createdAt,
    };
  }

  async getOnboardingUrl(onboardingId: string): Promise<string> {
    const session = await this.getOnboardingStatus(onboardingId);
    return session.redirectUrl || '';
  }

  private mapStatus(swanStatus: string) {
    const statusMap: Record<string, OnboardingSession['status']> = {
      NotStarted: 'not_started',
      Ongoing: 'pending',
      WaitingForReview: 'pending',
      Finalized: 'verified',
      Invalid: 'rejected',
    };
    return statusMap[swanStatus] || 'pending';
  }
}
