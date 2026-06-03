import 'reflect-metadata';
import { config } from 'dotenv';
config();
import dataSource from './data-source';
import {
  UserEntity,
  AccountEntity,
  CardEntity,
  TransactionEntity,
  RecipientEntity,
  OnboardingEntity,
  ExchangeRateEntity,
  JarEntity,
} from './entities';

const EMAIL = 'michael@jakob.tv';

interface SeedTx {
  merchant: string;
  category: string;
  amountCents: number;
  direction: 'inbound' | 'outbound';
  daysAgo: number;
  reference?: string;
  counterpartyIban?: string;
}

async function seed() {
  const ds = await dataSource.initialize();
  const userRepo = ds.getRepository(UserEntity);
  const accountRepo = ds.getRepository(AccountEntity);
  const cardRepo = ds.getRepository(CardEntity);
  const txRepo = ds.getRepository(TransactionEntity);
  const recipientRepo = ds.getRepository(RecipientEntity);
  const onboardingRepo = ds.getRepository(OnboardingEntity);
  const rateRepo = ds.getRepository(ExchangeRateEntity);
  const jarRepo = ds.getRepository(JarEntity);

  let user = await userRepo.findOne({ where: { email: EMAIL } });
  if (!user) {
    user = userRepo.create({
      email: EMAIL,
      emailVerified: true,
      firstName: 'Michael',
      lastName: 'Jakob',
      dateOfBirth: '1995-03-12',
      nationality: 'DE',
      residenceCountry: 'DE',
      residenceAddress: {
        line1: 'Torstraße 89',
        line2: '3. OG',
        city: 'Berlin',
        postalCode: '10119',
        country: 'Germany',
      },
      role: 'admin',
    });
    user = await userRepo.save(user);
    console.log(`Created user ${EMAIL} (${user.id})`);
  } else {
    user.firstName = 'Michael';
    user.lastName = 'Jakob';
    user.dateOfBirth = '1995-03-12';
    user.nationality = 'DE';
    user.residenceCountry = 'DE';
    user.residenceAddress = {
      line1: 'Torstraße 89',
      line2: '3. OG',
      city: 'Berlin',
      postalCode: '10119',
      country: 'Germany',
    };
    user.role = 'admin';
    await userRepo.save(user);
    console.log(`Updated user ${EMAIL} (${user.id})`);
  }

  // Onboarding (completed)
  let onboarding = await onboardingRepo.findOne({ where: { userId: user.id } });
  if (!onboarding) {
    onboarding = onboardingRepo.create({
      userId: user.id,
      status: 'completed',
      kycCompletedAt: new Date('2025-01-10'),
      accountCreatedAt: new Date('2025-01-10'),
    });
    await onboardingRepo.save(onboarding);
    console.log('Created onboarding record');
  }

  // EUR account
  let eurAccount = await accountRepo.findOne({ where: { userId: user.id, currency: 'EUR' } });
  if (!eurAccount) {
    eurAccount = accountRepo.create({
      userId: user.id,
      providerAccountId: `acc_${user.id}_eur`,
      status: 'active',
      iban: 'DE89370400440532013000',
      bic: 'SWNBFR22',
      holderName: 'Michael Jakob',
      balanceCents: 1_847_320,
      currency: 'EUR',
    });
    eurAccount = await accountRepo.save(eurAccount);
    console.log(`Created EUR account (${eurAccount.id})`);
  }

  // USD account
  let usdAccount = await accountRepo.findOne({ where: { userId: user.id, currency: 'USD' } });
  if (!usdAccount) {
    usdAccount = accountRepo.create({
      userId: user.id,
      providerAccountId: `acc_${user.id}_usd`,
      status: 'active',
      iban: 'DE72370400440532019500',
      bic: 'SWNBFR22',
      holderName: 'Michael Jakob',
      balanceCents: 325_000,
      currency: 'USD',
    });
    usdAccount = await accountRepo.save(usdAccount);
    console.log(`Created USD account (${usdAccount.id})`);
  }

  // Cards
  const existingCards = await cardRepo.find({ where: { accountId: eurAccount.id } });
  if (existingCards.length === 0) {
    const mainCard = await cardRepo.save(cardRepo.create({
      accountId: eurAccount.id,
      providerCardId: `card_${user.id}_main`,
      type: 'virtual',
      status: 'active',
      last4: '8412',
      expiryMonth: 11,
      expiryYear: 28,
      cardholderName: 'Michael Jakob',
      name: 'Everyday',
      color: 'black',
      frozen: false,
      spendingLimit: { amount: 500_000, period: 'monthly' },
    }));

    const titaniumCard = await cardRepo.save(cardRepo.create({
      accountId: eurAccount.id,
      providerCardId: `card_${user.id}_titanium`,
      type: 'physical',
      status: 'active',
      last4: '3091',
      expiryMonth: 5,
      expiryYear: 29,
      cardholderName: 'Michael Jakob',
      name: 'Titanium',
      color: 'green',
      frozen: false,
      spendingLimit: { amount: 1_000_000, period: 'monthly' },
      atmEnabled: true,
    }));

    const subsCard = await cardRepo.save(cardRepo.create({
      accountId: eurAccount.id,
      providerCardId: `card_${user.id}_subs`,
      type: 'virtual',
      status: 'active',
      last4: '6750',
      expiryMonth: 9,
      expiryYear: 27,
      cardholderName: 'Michael Jakob',
      name: 'Subscriptions',
      color: 'white',
      frozen: false,
      spendingLimit: { amount: 30_000, period: 'monthly' },
    }));

    console.log('Created 3 cards');

    // Transactions for main card
    await seedTransactions(txRepo, eurAccount.id, mainCard.id, [
      { merchant: 'REWE', category: 'groceries', amountCents: 4780, direction: 'outbound', daysAgo: 0, reference: 'Weekly shop' },
      { merchant: 'Uber Eats', category: 'food', amountCents: 2340, direction: 'outbound', daysAgo: 0, reference: 'Dinner' },
      { merchant: 'BVG', category: 'transport', amountCents: 9900, direction: 'outbound', daysAgo: 1, reference: 'Monthly ticket' },
      { merchant: 'Amazon', category: 'shopping', amountCents: 8999, direction: 'outbound', daysAgo: 2, reference: 'Mechanical keyboard' },
      { merchant: 'Lidl', category: 'groceries', amountCents: 3210, direction: 'outbound', daysAgo: 3, reference: 'Groceries' },
      { merchant: 'Gorillas', category: 'groceries', amountCents: 1890, direction: 'outbound', daysAgo: 4, reference: 'Quick delivery' },
      { merchant: 'Steam', category: 'entertainment', amountCents: 4999, direction: 'outbound', daysAgo: 5, reference: 'Elden Ring DLC' },
      { merchant: 'Salary — AlleAktien GmbH', category: 'salary', amountCents: 580_000, direction: 'inbound', daysAgo: 5, reference: 'Salary June 2026' },
      { merchant: 'Vattenfall', category: 'utilities', amountCents: 8500, direction: 'outbound', daysAgo: 7, reference: 'Electricity' },
      { merchant: 'Amazon', category: 'shopping', amountCents: 2999, direction: 'inbound', daysAgo: 8, reference: 'Refund — returned item' },
      { merchant: 'Edeka', category: 'groceries', amountCents: 6230, direction: 'outbound', daysAgo: 9, reference: 'Groceries' },
      { merchant: 'MediaMarkt', category: 'shopping', amountCents: 34900, direction: 'outbound', daysAgo: 12, reference: 'Sony WH-1000XM5' },
      { merchant: 'Bolt', category: 'transport', amountCents: 1240, direction: 'outbound', daysAgo: 14, reference: 'Ride' },
      { merchant: 'Decathlon', category: 'shopping', amountCents: 7950, direction: 'outbound', daysAgo: 18, reference: 'Running shoes' },
      { merchant: 'Apple Store', category: 'shopping', amountCents: 12900, direction: 'outbound', daysAgo: 22, reference: 'MagSafe charger' },
    ]);

    // Transactions for titanium card
    await seedTransactions(txRepo, eurAccount.id, titaniumCard.id, [
      { merchant: 'Lufthansa', category: 'travel', amountCents: 42500, direction: 'outbound', daysAgo: 3, reference: 'Flight BER → BCN' },
      { merchant: 'Booking.com', category: 'travel', amountCents: 68000, direction: 'outbound', daysAgo: 3, reference: '4 nights Barcelona' },
      { merchant: 'Nobu', category: 'food', amountCents: 15600, direction: 'outbound', daysAgo: 6, reference: 'Dinner for two' },
      { merchant: 'Zara', category: 'shopping', amountCents: 18900, direction: 'outbound', daysAgo: 10, reference: 'Summer clothes' },
      { merchant: 'Soho House', category: 'food', amountCents: 8700, direction: 'outbound', daysAgo: 16, reference: 'Brunch' },
      { merchant: 'Apple Store', category: 'shopping', amountCents: 134900, direction: 'outbound', daysAgo: 20, reference: 'MacBook Air M4' },
      { merchant: 'Tesla Supercharger', category: 'transport', amountCents: 3450, direction: 'outbound', daysAgo: 25, reference: 'Charging' },
    ]);

    // Transactions for subs card
    await seedTransactions(txRepo, eurAccount.id, subsCard.id, [
      { merchant: 'Spotify', category: 'subscription', amountCents: 1099, direction: 'outbound', daysAgo: 1, reference: 'Premium Family' },
      { merchant: 'ChatGPT', category: 'subscription', amountCents: 2200, direction: 'outbound', daysAgo: 2, reference: 'Plus plan' },
      { merchant: 'Netflix', category: 'subscription', amountCents: 1799, direction: 'outbound', daysAgo: 4, reference: 'Standard plan' },
      { merchant: 'Cursor', category: 'subscription', amountCents: 2000, direction: 'outbound', daysAgo: 6, reference: 'Pro plan' },
      { merchant: 'iCloud', category: 'subscription', amountCents: 299, direction: 'outbound', daysAgo: 8, reference: '200GB' },
      { merchant: 'YouTube Premium', category: 'subscription', amountCents: 1199, direction: 'outbound', daysAgo: 12, reference: 'Monthly' },
      { merchant: 'Notion', category: 'subscription', amountCents: 1000, direction: 'outbound', daysAgo: 15, reference: 'Plus plan' },
      { merchant: 'GitHub', category: 'subscription', amountCents: 400, direction: 'outbound', daysAgo: 18, reference: 'Pro' },
      { merchant: 'Linear', category: 'subscription', amountCents: 800, direction: 'outbound', daysAgo: 20, reference: 'Standard' },
      { merchant: 'Vercel', category: 'subscription', amountCents: 2000, direction: 'outbound', daysAgo: 22, reference: 'Pro plan' },
    ]);

    console.log('Seeded transactions');
  }

  // Recipients
  const existingRecipients = await recipientRepo.find({ where: { userId: user.id } });
  if (existingRecipients.length === 0) {
    const recipients = [
      { name: 'Sarah Jakob', iban: 'DE89370400440532013100', bank: 'Commerzbank', country: 'DE', isFavorite: true },
      { name: 'AlleAktien GmbH', iban: 'DE27100777770209299700', bank: 'Deutsche Bank', country: 'DE', isFavorite: true },
      { name: 'Landlord — BIM GmbH', iban: 'DE33100110012628588358', bank: 'N26', country: 'DE', isFavorite: false },
      { name: 'Max Müller', iban: 'DE75512108001245126199', bank: 'ING', country: 'DE', isFavorite: false },
      { name: 'Elena Costa', iban: 'ES9121000418450200051332', bank: 'Caixabank', country: 'ES', isFavorite: false },
    ];
    for (const r of recipients) {
      await recipientRepo.save(recipientRepo.create({ userId: user.id, ...r }));
    }
    console.log(`Seeded ${recipients.length} recipients`);
  }

  // Jars
  const existingJars = await jarRepo.find({ where: { userId: user.id } });
  if (existingJars.length === 0) {
    const jars = [
      { name: 'Holiday', emoji: '🏖️', currency: 'EUR', balanceCents: 250_000, targetCents: 500_000, color: '#60A5FA' },
      { name: 'Emergency', emoji: '🛟', currency: 'EUR', balanceCents: 800_000, targetCents: 1_000_000, color: '#F97316' },
      { name: 'New laptop', emoji: '💻', currency: 'EUR', balanceCents: 120_000, targetCents: 200_000, color: '#8B5CF6' },
    ];
    for (const j of jars) {
      await jarRepo.save(jarRepo.create({ userId: user.id, ...j }));
    }
    console.log(`Seeded ${jars.length} jars`);
  }

  // Exchange rates
  const seedRates = [
    { baseCurrency: 'EUR', targetCurrency: 'USD', rate: 1.08 },
    { baseCurrency: 'EUR', targetCurrency: 'GBP', rate: 0.85 },
    { baseCurrency: 'EUR', targetCurrency: 'CHF', rate: 0.94 },
    { baseCurrency: 'EUR', targetCurrency: 'JPY', rate: 162.5 },
    { baseCurrency: 'USD', targetCurrency: 'EUR', rate: 0.925 },
    { baseCurrency: 'GBP', targetCurrency: 'EUR', rate: 1.176 },
  ];
  for (const r of seedRates) {
    const existing = await rateRepo.findOne({ where: { baseCurrency: r.baseCurrency, targetCurrency: r.targetCurrency } });
    if (!existing) await rateRepo.save(rateRepo.create(r));
  }
  console.log('Exchange rates OK');

  await ds.destroy();
  console.log('Done — all data seeded for michael@jakob.tv');
}

async function seedTransactions(
  txRepo: any,
  accountId: string,
  cardId: string,
  txs: SeedTx[],
) {
  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    const date = new Date();
    date.setDate(date.getDate() - tx.daysAgo);
    date.setHours(9 + (i % 10), (i * 7) % 60, 0, 0);

    const saved = await txRepo.save(
      txRepo.create({
        accountId,
        cardId,
        providerTransactionId: `seed_michael_${cardId}_${i}`,
        direction: tx.direction,
        status: 'settled',
        amountCents: tx.amountCents,
        currency: 'EUR',
        counterpartyName: tx.merchant,
        counterpartyIban: tx.counterpartyIban,
        reference: tx.reference,
        category: tx.category,
        bookedAt: date,
      }),
    );
    await txRepo.update(saved.id, { createdAt: date });
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
