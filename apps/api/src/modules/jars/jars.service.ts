import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JarEntity, AccountEntity } from '@/database/entities';

const SUPPORTED_CURRENCIES = [
  'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'HKD', 'SGD', 'CNY',
];

export interface CreateJarInput {
  name: string;
  currency: string;
  emoji?: string;
  color?: string;
  targetCents?: number;
  initialDepositCents?: number;
}

export interface UpdateJarInput {
  name?: string;
  emoji?: string;
  color?: string;
  targetCents?: number | null;
}

@Injectable()
export class JarsService {
  constructor(
    @InjectRepository(JarEntity)
    private readonly jarRepo: Repository<JarEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
  ) {}

  private serialize(jar: JarEntity) {
    return {
      id: jar.id,
      name: jar.name,
      currency: jar.currency,
      balanceCents: Number(jar.balanceCents),
      targetCents: jar.targetCents == null ? null : Number(jar.targetCents),
      emoji: jar.emoji ?? null,
      color: jar.color ?? null,
      createdAt: jar.createdAt,
      updatedAt: jar.updatedAt,
    };
  }

  async list(userId: string) {
    const jars = await this.jarRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
    return jars.map((j) => this.serialize(j));
  }

  private async getHub(userId: string, currency: string) {
    const hub = await this.accountRepo.findOne({ where: { userId, currency } });
    if (!hub) {
      throw new BadRequestException(
        `Open a ${currency} account before creating a ${currency} jar`,
      );
    }
    return hub;
  }

  async create(userId: string, input: CreateJarInput) {
    const currency = (input.currency || 'EUR').toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(currency)) {
      throw new BadRequestException(`Unsupported currency: ${input.currency}`);
    }
    const name = (input.name || '').trim();
    if (!name) throw new BadRequestException('Jar name is required');

    const hub = await this.getHub(userId, currency);

    const deposit = Math.max(0, Math.round(input.initialDepositCents ?? 0));
    if (deposit > 0 && Number(hub.balanceCents) < deposit) {
      throw new BadRequestException(`Insufficient ${currency} balance to fund this jar`);
    }

    const jar = this.jarRepo.create({
      userId,
      name,
      currency,
      balanceCents: deposit,
      targetCents:
        input.targetCents != null && input.targetCents > 0
          ? Math.round(input.targetCents)
          : null,
      emoji: input.emoji?.slice(0, 8),
      color: input.color,
    });

    if (deposit > 0) {
      hub.balanceCents = Number(hub.balanceCents) - deposit;
      await this.accountRepo.save(hub);
    }
    await this.jarRepo.save(jar);

    return this.serialize(jar);
  }

  async update(userId: string, id: string, input: UpdateJarInput) {
    const jar = await this.jarRepo.findOne({ where: { id, userId } });
    if (!jar) throw new NotFoundException('Jar not found');

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException('Jar name cannot be empty');
      jar.name = name;
    }
    if (input.emoji !== undefined) jar.emoji = input.emoji?.slice(0, 8);
    if (input.color !== undefined) jar.color = input.color;
    if (input.targetCents !== undefined) {
      jar.targetCents =
        input.targetCents != null && input.targetCents > 0
          ? Math.round(input.targetCents)
          : null;
    }

    await this.jarRepo.save(jar);
    return this.serialize(jar);
  }

  /** Moves money between a jar and its currency hub account. */
  async move(
    userId: string,
    id: string,
    amountCents: number,
    direction: 'in' | 'out',
  ) {
    const amount = Math.round(amountCents);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const jar = await this.jarRepo.findOne({ where: { id, userId } });
    if (!jar) throw new NotFoundException('Jar not found');

    const hub = await this.getHub(userId, jar.currency);

    if (direction === 'in') {
      if (Number(hub.balanceCents) < amount) {
        throw new BadRequestException('Insufficient available balance');
      }
      hub.balanceCents = Number(hub.balanceCents) - amount;
      jar.balanceCents = Number(jar.balanceCents) + amount;
    } else {
      if (Number(jar.balanceCents) < amount) {
        throw new BadRequestException('Insufficient jar balance');
      }
      jar.balanceCents = Number(jar.balanceCents) - amount;
      hub.balanceCents = Number(hub.balanceCents) + amount;
    }

    await this.accountRepo.save(hub);
    await this.jarRepo.save(jar);
    return this.serialize(jar);
  }

  /** Closes a jar, returning any remaining balance to its hub account. */
  async remove(userId: string, id: string) {
    const jar = await this.jarRepo.findOne({ where: { id, userId } });
    if (!jar) throw new NotFoundException('Jar not found');

    const remaining = Number(jar.balanceCents);
    if (remaining > 0) {
      const hub = await this.accountRepo.findOne({
        where: { userId, currency: jar.currency },
      });
      if (hub) {
        hub.balanceCents = Number(hub.balanceCents) + remaining;
        await this.accountRepo.save(hub);
      }
    }

    await this.jarRepo.remove(jar);
    return { deleted: true, returnedCents: remaining };
  }
}
