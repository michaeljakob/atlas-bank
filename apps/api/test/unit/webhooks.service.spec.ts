import { WebhooksService } from '@/modules/webhooks/webhooks.service';

function repoMock(overrides: any = {}) {
  return {
    findOne: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => x),
    ...overrides,
  };
}

describe('WebhooksService', () => {
  let webhookRepo: any;
  let onboardingRepo: any;
  let accountRepo: any;
  let txRepo: any;
  let swanWebhook: any;
  let accountProvider: any;
  let service: WebhooksService;

  const account = { id: 'acc-local', providerAccountId: 'prov-acc', balanceCents: 0 };

  beforeEach(() => {
    webhookRepo = repoMock();
    onboardingRepo = repoMock();
    accountRepo = repoMock({ findOne: jest.fn().mockResolvedValue({ ...account }) });
    txRepo = repoMock();
    swanWebhook = {
      verifySignature: jest.fn().mockReturnValue(true),
      parseEvent: jest.fn((raw: string) => JSON.parse(raw)),
    };
    accountProvider = {
      getTransaction: jest.fn().mockResolvedValue({
        providerId: 'tx-1',
        accountId: 'prov-acc',
        direction: 'inbound',
        status: 'settled',
        amount: { amount: 5000, currency: 'EUR' },
        counterpartyName: 'Acme',
        reference: 'invoice',
      }),
      getBalance: jest.fn().mockResolvedValue({ amount: 5000, currency: 'EUR' }),
      getAccount: jest.fn(),
    };
    service = new WebhooksService(webhookRepo, onboardingRepo, accountRepo, txRepo, swanWebhook, accountProvider);
  });

  it('rejects an invalid signature', async () => {
    swanWebhook.verifySignature.mockReturnValue(false);
    await expect(service.handleSwanWebhook('{}', 'bad')).rejects.toThrow('Invalid signature');
  });

  it('is idempotent: a duplicate event is skipped', async () => {
    webhookRepo.findOne.mockResolvedValue({ id: 'existing' });
    const raw = JSON.stringify({ eventId: 'evt-1', eventType: 'Transaction.Booked', resourceId: 'tx-1' });
    await service.handleSwanWebhook(raw, 'sig');
    expect(accountProvider.getTransaction).not.toHaveBeenCalled();
  });

  it('upserts a transaction and refreshes the account balance from the provider', async () => {
    webhookRepo.findOne.mockResolvedValue(null);
    txRepo.findOne.mockResolvedValue(null);
    const raw = JSON.stringify({ eventId: 'evt-2', eventType: 'Transaction.Booked', resourceId: 'tx-1' });

    await service.handleSwanWebhook(raw, 'sig');

    expect(accountProvider.getTransaction).toHaveBeenCalledWith('tx-1');
    expect(txRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ providerTransactionId: 'tx-1', amountCents: 5000, status: 'settled' }),
    );
    // Balance is taken from the provider (authoritative), not computed locally.
    expect(accountProvider.getBalance).toHaveBeenCalledWith('prov-acc');
    expect(accountRepo.save).toHaveBeenCalledWith(expect.objectContaining({ balanceCents: 5000 }));
  });

  it('updates status on an existing transaction rather than duplicating', async () => {
    webhookRepo.findOne.mockResolvedValue(null);
    txRepo.findOne.mockResolvedValue({ providerTransactionId: 'tx-1', status: 'pending', amountCents: 5000 });
    const raw = JSON.stringify({ eventId: 'evt-3', eventType: 'Transaction.Booked', resourceId: 'tx-1' });

    await service.handleSwanWebhook(raw, 'sig');

    expect(txRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'settled' }));
  });
});
