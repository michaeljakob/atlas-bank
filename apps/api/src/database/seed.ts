import 'reflect-metadata';
import dataSource from './data-source';
import { UserEntity, ExchangeRateEntity } from './entities';

/**
 * Idempotent seed for local/staging environments. Run with:
 *   npx ts-node src/database/seed.ts
 */
async function seed() {
  const ds = await dataSource.initialize();

  const userRepo = ds.getRepository(UserEntity);
  const rateRepo = ds.getRepository(ExchangeRateEntity);

  const demoEmail = 'demo@auriga-money.local';
  let user = await userRepo.findOne({ where: { email: demoEmail } });
  if (!user) {
    user = userRepo.create({
      email: demoEmail,
      emailVerified: true,
      firstName: 'Demo',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      nationality: 'DE',
      residenceCountry: 'DE',
    });
    await userRepo.save(user);
    console.log(`Seeded demo user ${demoEmail}`);
  }

  const seedRates: { baseCurrency: string; targetCurrency: string; rate: number }[] = [
    { baseCurrency: 'EUR', targetCurrency: 'USD', rate: 1.08 },
    { baseCurrency: 'EUR', targetCurrency: 'GBP', rate: 0.85 },
    { baseCurrency: 'USD', targetCurrency: 'EUR', rate: 0.92 },
    { baseCurrency: 'GBP', targetCurrency: 'EUR', rate: 1.18 },
  ];
  for (const r of seedRates) {
    await rateRepo.save(rateRepo.create(r));
  }
  console.log(`Seeded ${seedRates.length} exchange rates`);

  await ds.destroy();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
