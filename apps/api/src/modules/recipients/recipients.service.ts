import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipientEntity } from '@/database/entities';
import { isValidIban } from '@atlas-bank/shared';

@Injectable()
export class RecipientsService {
  constructor(
    @InjectRepository(RecipientEntity)
    private readonly recipientRepo: Repository<RecipientEntity>,
  ) {}

  async list(userId: string) {
    return this.recipientRepo.find({
      where: { userId },
      order: { isFavorite: 'DESC', name: 'ASC' },
    });
  }

  async create(userId: string, input: { name: string; iban: string; bic?: string; bank?: string; country?: string; email?: string; phone?: string; notes?: string }) {
    if (!isValidIban(input.iban)) {
      throw new ConflictException('Invalid IBAN');
    }

    const existing = await this.recipientRepo.findOne({
      where: { userId, iban: input.iban },
    });
    if (existing) throw new ConflictException('Recipient with this IBAN already exists');

    const recipient = this.recipientRepo.create({ userId, ...input });
    return this.recipientRepo.save(recipient);
  }

  async update(userId: string, id: string, input: Partial<{ name: string; isFavorite: boolean; bank: string; bic: string; country: string; email: string; phone: string; notes: string }>) {
    const recipient = await this.recipientRepo.findOne({ where: { id, userId } });
    if (!recipient) throw new NotFoundException('Recipient not found');

    Object.assign(recipient, input);
    return this.recipientRepo.save(recipient);
  }

  async remove(userId: string, id: string) {
    const recipient = await this.recipientRepo.findOne({ where: { id, userId } });
    if (!recipient) throw new NotFoundException('Recipient not found');
    await this.recipientRepo.remove(recipient);
    return { deleted: true };
  }
}
