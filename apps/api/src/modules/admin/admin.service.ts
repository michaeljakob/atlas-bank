import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AccountEntity,
  CardEntity,
  TransactionEntity,
  UserEntity,
} from '@/database/entities';

@Injectable()
export class AdminService {
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

  async getOverview() {
    const [users, admins, accounts, cards, transactions] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { role: 'admin' } }),
      this.accountRepo.count(),
      this.cardRepo.count(),
      this.txRepo.count(),
    ]);

    const balance = await this.accountRepo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.balanceCents), 0)', 'total')
      .getRawOne<{ total: string }>();

    return {
      users,
      admins,
      accounts,
      cards,
      transactions,
      totalBalanceCents: Number(balance?.total ?? 0),
    };
  }

  async listUsers(limit = 50) {
    const users = await this.userRepo.find({
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(limit, 1), 200),
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      handle: u.handle ?? null,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt ?? null,
    }));
  }
}
