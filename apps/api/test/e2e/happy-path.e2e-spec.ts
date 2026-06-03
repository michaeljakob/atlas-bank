import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from '@/app.module';
import { PAYMENT_PROVIDER } from '@/providers/providers.module';
import type { PaymentConsent, PaymentDetails } from '@auriga-money/provider-contracts';

/**
 * End-to-end happy path against the full Nest app (Fastify + in-memory SQLite,
 * SKIP_AUTH dev mode). The Swan payment provider is stubbed so we exercise our
 * own wiring — accounts → fund → send → status — without any network calls.
 */
describe('Happy path (e2e)', () => {
  let app: NestFastifyApplication;

  const paymentProviderStub = {
    initiatePayment: jest.fn(
      async (): Promise<PaymentConsent> => ({
        id: 'pay-123',
        consentUrl: 'https://swan.test/consent/pay-123',
        status: 'pending',
      }),
    ),
    getPaymentStatus: jest.fn(
      async (): Promise<PaymentDetails> => ({
        id: 'pay-123',
        consentUrl: 'https://swan.test/consent/pay-123',
        consentStatus: 'accepted',
        status: 'Booked',
        amount: { amount: 25000, currency: 'EUR' },
        creditorName: 'Jane Doe',
        creditorIban: 'DE89370400440532013000',
        reference: 'rent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ),
    getTransaction: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PAYMENT_PROVIDER)
      .useValue(paymentProviderStub)
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.register(fastifyCookie as any);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app?.close();
  });

  const inject = (opts: any) => app.getHttpAdapter().getInstance().inject(opts);

  it('serves a seeded EUR account for the dev user', async () => {
    const res = await inject({ method: 'GET', url: '/api/v1/accounts/all' });
    expect(res.statusCode).toBe(200);
    const accounts = res.json();
    expect(Array.isArray(accounts)).toBe(true);
    expect(accounts[0]).toMatchObject({ currency: 'EUR' });
    expect(accounts[0].balance.amount).toBeGreaterThan(0);
  });

  it('funds the account (sandbox top-up) and reflects the new balance', async () => {
    const before = (await inject({ method: 'GET', url: '/api/v1/accounts/all' })).json()[0].balance.amount;

    const topUp = await inject({
      method: 'POST',
      url: '/api/v1/top-up/simulate',
      payload: { amountCents: 50000, currency: 'EUR' },
    });
    expect(topUp.statusCode).toBe(201);
    expect(topUp.json()).toMatchObject({ credited: 50000, currency: 'EUR' });

    const after = (await inject({ method: 'GET', url: '/api/v1/accounts/all' })).json()[0].balance.amount;
    expect(after).toBe(before + 50000);
  });

  it('sends a transfer to a valid IBAN (SCA consent issued)', async () => {
    const res = await inject({
      method: 'POST',
      url: '/api/v1/payments/transfer',
      payload: {
        creditorIban: 'DE89370400440532013000',
        creditorName: 'Jane Doe',
        amountCents: 25000,
        reference: 'rent',
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({
      paymentId: 'pay-123',
      consentUrl: expect.stringContaining('consent'),
      status: 'pending',
    });
    expect(paymentProviderStub.initiatePayment).toHaveBeenCalled();
  });

  it('rejects a transfer to an invalid IBAN', async () => {
    const res = await inject({
      method: 'POST',
      url: '/api/v1/payments/transfer',
      payload: { creditorIban: 'NOT-AN-IBAN', creditorName: 'X', amountCents: 100 },
    });
    expect(res.statusCode).toBe(400);
  });

  it('reports delivered status for the transfer', async () => {
    const res = await inject({ method: 'GET', url: '/api/v1/payments/pay-123/details' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'delivered', amountCents: 25000 });
  });
});
