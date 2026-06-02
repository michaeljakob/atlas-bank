import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { CardProvider } from '@atlas-bank/provider-contracts';
import { CardEntity, AccountEntity, TransactionEntity, UserEntity } from '@/database/entities';
import { CARD_PROVIDER } from '@/providers/providers.module';
import { EmailService } from '@/modules/email/email.service';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepo: Repository<CardEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @Inject(CARD_PROVIDER)
    private readonly cardProvider: CardProvider,
    private readonly email: EmailService,
  ) {}

  private async notifyCardAction(userId: string, action: 'frozen' | 'unfrozen', last4: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;
    this.email
      .sendCardAlert(user.email, { action, last4 })
      .catch((err) => this.logger.warn(`Card alert email failed: ${err.message}`));
  }

  async getCards(userId: string) {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

    return this.cardRepo.find({
      where: { accountId: account.id },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Returns the spend/transaction history for a single card, newest first.
   * Cursor is the ISO `createdAt` of the last item from the previous page.
   */
  async getCardTransactions(
    userId: string,
    cardId: string,
    cursor?: string,
    limit = 25,
  ) {
    const card = await this.getOwnedCard(userId, cardId);

    const take = Math.min(Math.max(limit, 1), 100);
    const cursorDate = cursor ? new Date(cursor) : null;

    const items = await this.txRepo.find({
      where: {
        cardId: card.id,
        ...(cursorDate && !isNaN(cursorDate.getTime())
          ? { createdAt: LessThan(cursorDate) }
          : {}),
      },
      order: { createdAt: 'DESC' },
      take: take + 1,
    });

    const hasNextPage = items.length > take;
    const page = hasNextPage ? items.slice(0, take) : items;

    return {
      items: page.map((t) => this.serializeTransaction(t)),
      hasNextPage,
      cursor: hasNextPage ? page[page.length - 1]?.createdAt?.toISOString() : undefined,
    };
  }

  private serializeTransaction(t: TransactionEntity) {
    return {
      id: t.id,
      cardId: t.cardId ?? null,
      direction: t.direction,
      status: t.status,
      amountCents: Number(t.amountCents),
      currency: t.currency,
      counterpartyName: t.counterpartyName,
      counterpartyIban: t.counterpartyIban ?? null,
      reference: t.reference ?? '',
      category: t.category ?? 'other',
      createdAt: (t.bookedAt ?? t.createdAt)?.toISOString?.() ?? t.createdAt,
    };
  }

  async freezeCard(userId: string, cardId: string) {
    const card = await this.getOwnedCard(userId, cardId);
    await this.cardProvider.updateCard({ cardId: card.providerCardId, frozen: true });
    card.frozen = true;
    card.status = 'frozen';
    const saved = await this.cardRepo.save(card);
    await this.notifyCardAction(userId, 'frozen', card.last4);
    return saved;
  }

  async unfreezeCard(userId: string, cardId: string) {
    const card = await this.getOwnedCard(userId, cardId);
    await this.cardProvider.updateCard({ cardId: card.providerCardId, frozen: false });
    card.frozen = false;
    card.status = 'active';
    const saved = await this.cardRepo.save(card);
    await this.notifyCardAction(userId, 'unfrozen', card.last4);
    return saved;
  }

  async getSecureDetails(userId: string, cardId: string) {
    const card = await this.getOwnedCard(userId, cardId);
    return this.cardProvider.getSecureDetailsUrl(card.providerCardId);
  }

  async provisionWallet(userId: string, cardId: string, walletType: 'apple_pay' | 'google_pay') {
    const card = await this.getOwnedCard(userId, cardId);
    return this.cardProvider.getWalletProvisioningData(card.providerCardId, walletType);
  }

  async orderPhysicalCard(userId: string, deliveryAddress: { line1: string; line2?: string; city: string; postalCode: string; country: string }) {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

    const providerCard = await this.cardProvider.issueCard({
      accountId: account.providerAccountId,
      type: 'physical',
      deliveryAddress,
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

  async renameCard(userId: string, cardId: string, name: string) {
    const card = await this.getOwnedCard(userId, cardId);
    card.name = name.trim() || null;
    return this.cardRepo.save(card);
  }

  async updateCard(
    userId: string,
    cardId: string,
    patch: {
      color?: 'black' | 'white' | 'green';
      name?: string;
      onlineEnabled?: boolean;
      contactlessEnabled?: boolean;
      atmEnabled?: boolean;
      internationalEnabled?: boolean;
      limitCents?: number;
    },
  ) {
    const card = await this.getOwnedCard(userId, cardId);
    if (patch.color) card.color = patch.color;
    if (patch.name !== undefined) card.name = patch.name.trim() || null;
    if (patch.onlineEnabled !== undefined) card.onlineEnabled = patch.onlineEnabled;
    if (patch.contactlessEnabled !== undefined) card.contactlessEnabled = patch.contactlessEnabled;
    if (patch.atmEnabled !== undefined) card.atmEnabled = patch.atmEnabled;
    if (patch.internationalEnabled !== undefined) card.internationalEnabled = patch.internationalEnabled;
    if (patch.limitCents !== undefined) {
      card.spendingLimit = { amount: Math.max(0, Math.round(patch.limitCents)), period: 'monthly' };
    }
    return this.cardRepo.save(card);
  }

  async deleteCard(userId: string, cardId: string) {
    const card = await this.getOwnedCard(userId, cardId);
    await this.cardProvider
      .cancelCard(card.providerCardId)
      .catch((err) => this.logger.warn(`Provider cancelCard failed: ${err.message}`));
    await this.cardRepo.remove(card);
    return { deleted: true };
  }

  private async getOwnedCard(userId: string, cardId: string): Promise<CardEntity> {
    const account = await this.accountRepo.findOne({ where: { userId } });
    if (!account) throw new NotFoundException('No account found');

    const card = await this.cardRepo.findOne({ where: { id: cardId, accountId: account.id } });
    if (!card) throw new NotFoundException('Card not found');

    return card;
  }
}
