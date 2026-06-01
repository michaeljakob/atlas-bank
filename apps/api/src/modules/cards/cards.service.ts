import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardProvider } from '@atlas-bank/provider-contracts';
import { CardEntity, AccountEntity } from '@/database/entities';
import { CARD_PROVIDER } from '@/providers/providers.module';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepo: Repository<CardEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @Inject(CARD_PROVIDER)
    private readonly cardProvider: CardProvider,
  ) {}

  async getCards(userId: string) {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

    return this.cardRepo.find({ where: { accountId: account.id } });
  }

  async freezeCard(userId: string, cardId: string) {
    const card = await this.getOwnedCard(userId, cardId);
    await this.cardProvider.updateCard({ cardId: card.providerCardId, frozen: true });
    card.frozen = true;
    card.status = 'frozen';
    return this.cardRepo.save(card);
  }

  async unfreezeCard(userId: string, cardId: string) {
    const card = await this.getOwnedCard(userId, cardId);
    await this.cardProvider.updateCard({ cardId: card.providerCardId, frozen: false });
    card.frozen = false;
    card.status = 'active';
    return this.cardRepo.save(card);
  }

  async getSecureDetails(userId: string, cardId: string) {
    const card = await this.getOwnedCard(userId, cardId);
    return this.cardProvider.getSecureDetailsUrl(card.providerCardId);
  }

  async provisionWallet(userId: string, cardId: string, walletType: 'apple_pay' | 'google_pay') {
    const card = await this.getOwnedCard(userId, cardId);
    return this.cardProvider.getWalletProvisioningData(card.providerCardId, walletType);
  }

  async orderPhysicalCard(userId: string) {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

    const providerCard = await this.cardProvider.issueCard({
      accountId: account.providerAccountId,
      type: 'physical',
    });

    const card = this.cardRepo.create({
      accountId: account.id,
      providerCardId: providerCard.providerId,
      type: 'physical',
      status: 'processing',
      last4: providerCard.last4,
      expiryMonth: providerCard.expiryMonth,
      expiryYear: providerCard.expiryYear,
      cardholderName: account.holderName,
    });

    return this.cardRepo.save(card);
  }

  private async getOwnedCard(userId: string, cardId: string): Promise<CardEntity> {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

    const card = await this.cardRepo.findOne({ where: { id: cardId, accountId: account.id } });
    if (!card) throw new NotFoundException('Card not found');

    return card;
  }
}
