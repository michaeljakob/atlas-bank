import { BadRequestException } from '@nestjs/common';
import { OnboardingService } from '@/modules/onboarding/onboarding.service';

function repoMock(overrides: any = {}) {
  return {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => ({ id: x.id || 'gen-id', ...x })),
    ...overrides,
  };
}

const details = {
  userId: 'user-1',
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  nationality: 'DE',
  residenceCountry: 'DE',
  residenceAddress: { line1: '1 St', city: 'Berlin', postalCode: '10117', country: 'DE' },
};

describe('OnboardingService state machine', () => {
  let onboardingRepo: any;
  let userRepo: any;
  let accountRepo: any;
  let cardRepo: any;
  let onboardingProvider: any;
  let accountProvider: any;
  let cardProvider: any;
  let email: any;
  let service: OnboardingService;

  beforeEach(() => {
    onboardingRepo = repoMock();
    userRepo = repoMock({
      findOneOrFail: jest.fn().mockResolvedValue({ id: 'user-1', email: 'jane@doe.com' }),
      findOne: jest.fn().mockResolvedValue({ id: 'user-1', email: 'jane@doe.com', firstName: 'Jane' }),
    });
    accountRepo = repoMock();
    cardRepo = repoMock();
    onboardingProvider = {
      createOnboarding: jest.fn().mockResolvedValue({ providerId: 'onb-1', redirectUrl: 'https://kyc' }),
      getOnboardingStatus: jest.fn(),
    };
    accountProvider = {
      createAccount: jest.fn().mockResolvedValue({ providerId: 'acc-1', iban: 'DE..', bic: 'X', holderName: 'Jane Doe' }),
    };
    cardProvider = {
      issueCard: jest.fn().mockResolvedValue({ providerId: 'card-1', last4: '4242', expiryMonth: 12, expiryYear: 30 }),
    };
    email = { sendWelcome: jest.fn().mockResolvedValue(undefined) };
    service = new OnboardingService(
      onboardingRepo, userRepo, accountRepo, cardRepo,
      onboardingProvider, accountProvider, cardProvider, email,
    );
  });

  it('start sets status to kyc_pending (enabling the status poll)', async () => {
    await service.startOnboarding(details as any);
    expect(onboardingRepo.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'kyc_pending' }));
  });

  it('getStatus polls the provider while pending and advances to kyc_verified', async () => {
    onboardingRepo.findOne.mockResolvedValue({ id: 'o1', status: 'kyc_pending', providerOnboardingId: 'onb-1' });
    onboardingProvider.getOnboardingStatus.mockResolvedValue({ status: 'verified' });

    const res = await service.getStatus('user-1');

    expect(onboardingProvider.getOnboardingStatus).toHaveBeenCalledWith('onb-1');
    expect(res.status).toBe('kyc_verified');
  });

  it('getStatus does not poll for terminal statuses', async () => {
    onboardingRepo.findOne.mockResolvedValue({ id: 'o1', status: 'completed', providerOnboardingId: 'onb-1' });
    await service.getStatus('user-1');
    expect(onboardingProvider.getOnboardingStatus).not.toHaveBeenCalled();
  });

  it('complete rejects when KYC is not verified', async () => {
    onboardingRepo.findOne.mockResolvedValue({ id: 'o1', status: 'kyc_pending' });
    await expect(service.completeOnboarding('user-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('complete provisions account + card and sends the welcome email when verified', async () => {
    onboardingRepo.findOne.mockResolvedValue({
      id: 'o1', status: 'kyc_verified', providerOnboardingId: 'onb-1',
    });

    const res = await service.completeOnboarding('user-1');

    expect(accountProvider.createAccount).toHaveBeenCalled();
    expect(cardProvider.issueCard).toHaveBeenCalled();
    expect(email.sendWelcome).toHaveBeenCalledWith('jane@doe.com', 'Jane');
    expect(res.account).toBeDefined();
    expect(res.card).toBeDefined();
  });
});
