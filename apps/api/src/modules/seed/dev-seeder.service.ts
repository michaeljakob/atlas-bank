import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AccountEntity,
  CardEntity,
  TransactionEntity,
  UserEntity,
} from '@/database/entities';
import { isAuthBypassEnabled } from '@/common/guards/auth.guard';

const DEV_USER_ID = 'dev-user';

interface SeedTx {
  merchant: string;
  category: string;
  amountCents: number;
  direction: 'inbound' | 'outbound';
  daysAgo: number;
  reference?: string;
}

/**
 * Seeds a realistic dataset for the local `SKIP_AUTH` development mode, which
 * runs against an in-memory SQLite database. This makes the cards experience
 * (and its transaction history) work end-to-end without a live Swan account.
 *
 * It is hard-gated to the auth-bypass dev mode and is a no-op everywhere else,
 * so it can never run in staging or production.
 */
@Injectable()
export class DevSeederService implements OnModuleInit {
  private readonly logger = new Logger(DevSeederService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(CardEntity)
    private readonly cardRepo: Repository<CardEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
  ) {}

  async onModuleInit() {
    if (!isAuthBypassEnabled()) return;

    const existing = await this.accountRepo.findOne({
      where: { userId: DEV_USER_ID },
    });
    if (existing) return;

    this.logger.log('Seeding development data for dev-user…');

    // The auth-bypass guard injects a fixed `dev-user` id; create the matching
    // user row so the account foreign key is satisfied.
    const existingUser = await this.userRepo.findOne({
      where: { id: DEV_USER_ID },
    });
    if (!existingUser) {
      await this.userRepo.save(
        this.userRepo.create({
          id: DEV_USER_ID,
          email: 'dev@auriga-money.local',
          role: 'admin',
          firstName: 'Alex',
          lastName: 'Johnson',
          dateOfBirth: '1992-04-17',
          nationality: 'DE',
          residenceCountry: 'DE',
          residenceAddress: {
            line1: 'Friedrichstr. 123',
            city: 'Berlin',
            postalCode: '10117',
            country: 'Germany',
          },
          emailVerified: true,
        }),
      );
    }

    const account = await this.accountRepo.save(
      this.accountRepo.create({
        userId: DEV_USER_ID,
        providerAccountId: 'acc_dev_main',
        status: 'active',
        iban: 'FR7630004028370001002653882',
        bic: 'SWNBFR22',
        holderName: 'Alex Johnson',
        balanceCents: 1_284_500,
        currency: 'EUR',
      }),
    );

    const mainCard = await this.cardRepo.save(
      this.cardRepo.create({
        accountId: account.id,
        providerCardId: 'card_dev_main',
        type: 'virtual',
        status: 'active',
        last4: '4289',
        expiryMonth: 12,
        expiryYear: 28,
        cardholderName: account.holderName,
        name: 'Main virtual',
        frozen: false,
        spendingLimit: { amount: 500_000, period: 'monthly' },
      }),
    );

    const titaniumCard = await this.cardRepo.save(
      this.cardRepo.create({
        accountId: account.id,
        providerCardId: 'card_dev_titanium',
        type: 'physical',
        status: 'active',
        last4: '7831',
        expiryMonth: 6,
        expiryYear: 29,
        cardholderName: account.holderName,
        name: 'Titanium card',
        frozen: false,
        spendingLimit: { amount: 1_000_000, period: 'monthly' },
      }),
    );

    const subsCard = await this.cardRepo.save(
      this.cardRepo.create({
        accountId: account.id,
        providerCardId: 'card_dev_subs',
        type: 'virtual',
        status: 'active',
        last4: '0052',
        expiryMonth: 7,
        expiryYear: 26,
        cardholderName: account.holderName,
        name: 'Subscriptions',
        frozen: false,
        spendingLimit: { amount: 50_000, period: 'monthly' },
      }),
    );

    await this.seedTransactions(account.id, mainCard.id, [
      { merchant: 'Whole Foods Market', category: 'groceries', amountCents: 6720, direction: 'outbound', daysAgo: 0, reference: 'Weekly groceries' },
      { merchant: 'Uber', category: 'transport', amountCents: 1840, direction: 'outbound', daysAgo: 0, reference: 'Ride home' },
      { merchant: 'Starbucks', category: 'food', amountCents: 575, direction: 'outbound', daysAgo: 1, reference: 'Flat white' },
      { merchant: 'Amazon', category: 'shopping', amountCents: 15900, direction: 'outbound', daysAgo: 2, reference: 'USB-C hub' },
      { merchant: 'Shell', category: 'transport', amountCents: 7240, direction: 'outbound', daysAgo: 4, reference: 'Fuel' },
      { merchant: 'IKEA', category: 'shopping', amountCents: 23400, direction: 'outbound', daysAgo: 6, reference: 'Desk lamp & shelves' },
      { merchant: 'Amazon', category: 'shopping', amountCents: 4200, direction: 'inbound', daysAgo: 7, reference: 'Refund — returned item' },
      { merchant: 'Lidl', category: 'groceries', amountCents: 4310, direction: 'outbound', daysAgo: 9, reference: 'Groceries' },
      { merchant: 'Deliveroo', category: 'food', amountCents: 3290, direction: 'outbound', daysAgo: 12, reference: 'Dinner' },
      { merchant: 'Apple Store', category: 'shopping', amountCents: 12900, direction: 'outbound', daysAgo: 18, reference: 'MagSafe charger' },
      { merchant: 'Decathlon', category: 'shopping', amountCents: 8950, direction: 'outbound', daysAgo: 24, reference: 'Running shoes' },
    ]);

    await this.seedTransactions(account.id, titaniumCard.id, [
      { merchant: 'Lufthansa', category: 'travel', amountCents: 48900, direction: 'outbound', daysAgo: 3, reference: 'Flight BER → LIS' },
      { merchant: 'Booking.com', category: 'travel', amountCents: 76500, direction: 'outbound', daysAgo: 3, reference: '3 nights · Lisbon' },
      { merchant: 'Nobu', category: 'food', amountCents: 18450, direction: 'outbound', daysAgo: 5, reference: 'Dinner for two' },
      { merchant: 'Hertz', category: 'travel', amountCents: 21300, direction: 'outbound', daysAgo: 8, reference: 'Car rental' },
      { merchant: 'Apple Store', category: 'shopping', amountCents: 134900, direction: 'outbound', daysAgo: 15, reference: 'MacBook Air M4' },
      { merchant: 'The Ritz-Carlton', category: 'travel', amountCents: 89000, direction: 'outbound', daysAgo: 22, reference: 'Weekend stay' },
      { merchant: 'Zara', category: 'shopping', amountCents: 15960, direction: 'outbound', daysAgo: 27, reference: 'Jacket' },
    ]);

    await this.seedTransactions(account.id, subsCard.id, [
      { merchant: 'Spotify', category: 'subscription', amountCents: 1299, direction: 'outbound', daysAgo: 0, reference: 'Premium plan' },
      { merchant: 'ChatGPT', category: 'subscription', amountCents: 2200, direction: 'outbound', daysAgo: 1, reference: 'ChatGPT Plus' },
      { merchant: 'Netflix', category: 'subscription', amountCents: 1799, direction: 'outbound', daysAgo: 3, reference: 'Standard plan' },
      { merchant: 'iCloud', category: 'subscription', amountCents: 299, direction: 'outbound', daysAgo: 5, reference: 'iCloud+ 200GB' },
      { merchant: 'Notion', category: 'subscription', amountCents: 1000, direction: 'outbound', daysAgo: 11, reference: 'Plus plan' },
      { merchant: 'YouTube Premium', category: 'subscription', amountCents: 1199, direction: 'outbound', daysAgo: 14, reference: 'Monthly' },
      { merchant: 'Adobe', category: 'subscription', amountCents: 5999, direction: 'outbound', daysAgo: 19, reference: 'Creative Cloud' },
      { merchant: 'GitHub', category: 'subscription', amountCents: 400, direction: 'outbound', daysAgo: 21, reference: 'Pro plan' },
    ]);

    this.logger.log('Development data seeded.');
  }

  private async seedTransactions(
    accountId: string,
    cardId: string,
    txs: SeedTx[],
  ) {
    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      const date = new Date();
      date.setDate(date.getDate() - tx.daysAgo);
      // Spread same-day items across the day so ordering stays stable.
      date.setHours(9 + (i % 10), (i * 7) % 60, 0, 0);

      const saved = await this.txRepo.save(
        this.txRepo.create({
          accountId,
          cardId,
          providerTransactionId: `seed_${cardId}_${i}`,
          direction: tx.direction,
          status: 'settled',
          amountCents: tx.amountCents,
          currency: 'EUR',
          counterpartyName: tx.merchant,
          reference: tx.reference,
          category: tx.category,
          bookedAt: date,
        }),
      );

      // `createdAt` is managed by @CreateDateColumn; force it to the booked
      // date so list ordering and date grouping reflect the real timeline.
      await this.txRepo.update(saved.id, { createdAt: date });
    }
  }
}
