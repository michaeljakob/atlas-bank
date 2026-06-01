import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingProvider, AccountProvider, CardProvider } from '@atlas-bank/provider-contracts';
import { OnboardingEntity, UserEntity, AccountEntity, CardEntity } from '@/database/entities';
import { ONBOARDING_PROVIDER, ACCOUNT_PROVIDER, CARD_PROVIDER } from '@/providers/providers.module';

interface StartOnboardingDto {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  residenceCountry: string;
  residenceAddress: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @InjectRepository(OnboardingEntity)
    private readonly onboardingRepo: Repository<OnboardingEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(CardEntity)
    private readonly cardRepo: Repository<CardEntity>,
    @Inject(ONBOARDING_PROVIDER)
    private readonly onboardingProvider: OnboardingProvider,
    @Inject(ACCOUNT_PROVIDER)
    private readonly accountProvider: AccountProvider,
    @Inject(CARD_PROVIDER)
    private readonly cardProvider: CardProvider,
  ) {}

  async startOnboarding(dto: StartOnboardingDto) {
    const user = await this.userRepo.findOneOrFail({ where: { id: dto.userId } });

    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.dateOfBirth = dto.dateOfBirth;
    user.nationality = dto.nationality;
    user.residenceCountry = dto.residenceCountry;
    user.residenceAddress = dto.residenceAddress;
    await this.userRepo.save(user);

    const session = await this.onboardingProvider.createOnboarding({
      details: {
        email: user.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: dto.dateOfBirth,
        nationality: dto.nationality,
        residenceCountry: dto.residenceCountry,
        residenceAddress: dto.residenceAddress,
      },
      redirectUrl: `${process.env.APP_URL || 'http://localhost:3000'}/onboarding/callback`,
    });

    const onboarding = this.onboardingRepo.create({
      userId: user.id,
      status: 'details_collected',
      providerOnboardingId: session.providerId,
      providerRedirectUrl: session.redirectUrl,
    });

    await this.onboardingRepo.save(onboarding);

    return {
      onboardingId: onboarding.id,
      kycUrl: session.redirectUrl,
      status: onboarding.status,
    };
  }

  async getStatus(userId: string) {
    const onboarding = await this.onboardingRepo.findOne({ where: { userId } });
    if (!onboarding) throw new BadRequestException('No onboarding found');

    if (onboarding.providerOnboardingId && onboarding.status === 'kyc_pending') {
      const providerStatus = await this.onboardingProvider.getOnboardingStatus(
        onboarding.providerOnboardingId,
      );

      if (providerStatus.status === 'verified' && onboarding.status !== 'kyc_verified') {
        onboarding.status = 'kyc_verified';
        onboarding.kycCompletedAt = new Date();
        await this.onboardingRepo.save(onboarding);
      }
    }

    return {
      onboardingId: onboarding.id,
      status: onboarding.status,
      kycUrl: onboarding.providerRedirectUrl,
    };
  }

  async completeOnboarding(userId: string) {
    const onboarding = await this.onboardingRepo.findOne({ where: { userId } });
    if (!onboarding || onboarding.status !== 'kyc_verified') {
      throw new BadRequestException('KYC not yet verified');
    }

    const providerAccount = await this.accountProvider.createAccount({
      onboardingId: onboarding.providerOnboardingId!,
    });

    const account = this.accountRepo.create({
      userId,
      providerAccountId: providerAccount.providerId,
      status: 'active',
      iban: providerAccount.iban,
      bic: providerAccount.bic,
      holderName: providerAccount.holderName,
      balanceCents: 0,
      currency: 'EUR',
    });
    await this.accountRepo.save(account);

    const providerCard = await this.cardProvider.issueCard({
      accountId: providerAccount.providerId,
      type: 'virtual',
    });

    const card = this.cardRepo.create({
      accountId: account.id,
      providerCardId: providerCard.providerId,
      type: 'virtual',
      status: 'active',
      last4: providerCard.last4,
      expiryMonth: providerCard.expiryMonth,
      expiryYear: providerCard.expiryYear,
      cardholderName: account.holderName,
    });
    await this.cardRepo.save(card);

    onboarding.status = 'completed';
    onboarding.accountCreatedAt = new Date();
    await this.onboardingRepo.save(onboarding);

    return {
      account: {
        id: account.id,
        iban: account.iban,
        bic: account.bic,
        holderName: account.holderName,
      },
      card: {
        id: card.id,
        last4: card.last4,
        type: card.type,
      },
    };
  }
}
