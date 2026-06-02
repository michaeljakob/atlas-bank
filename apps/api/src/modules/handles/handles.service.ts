import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserEntity, AccountEntity } from '@/database/entities';
import { isValidHandle, normalizeHandle } from '@atlas-bank/shared';

export interface ResolvedHandle {
  handle: string;
  name: string;
  iban: string;
  bic: string;
}

@Injectable()
export class HandlesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(AccountEntity)
    private readonly accounts: Repository<AccountEntity>,
  ) {}

  /** Whether a handle is syntactically valid AND not already taken. */
  async checkAvailability(raw: string): Promise<{ handle: string; valid: boolean; available: boolean }> {
    const handle = normalizeHandle(raw || '');
    const valid = isValidHandle(handle);
    if (!valid) return { handle, valid: false, available: false };
    const taken = await this.users.exist({ where: { handle } });
    return { handle, valid: true, available: !taken };
  }

  async getMyHandle(userId: string): Promise<{ handle: string | null }> {
    const user = await this.users.findOne({ where: { id: userId }, select: ['id', 'handle'] });
    return { handle: user?.handle ?? null };
  }

  /** Claim or change the current user's handle. */
  async claim(userId: string, raw: string): Promise<{ handle: string }> {
    const handle = normalizeHandle(raw || '');
    if (!isValidHandle(handle)) {
      throw new BadRequestException(
        'Handles must be 3-20 characters, start with a letter, and use only lowercase letters, numbers, or underscores.',
      );
    }

    const taken = await this.users.findOne({ where: { handle, id: Not(userId) }, select: ['id'] });
    if (taken) throw new ConflictException('That handle is already taken.');

    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    user.handle = handle;
    await this.users.save(user);
    return { handle };
  }

  /**
   * Resolve a handle to payable account details. Authenticated-only to prevent
   * scraping the directory of users -> IBANs.
   */
  async resolve(raw: string): Promise<ResolvedHandle> {
    const handle = normalizeHandle(raw || '');
    if (!isValidHandle(handle)) throw new BadRequestException('Invalid handle.');

    const user = await this.users.findOne({ where: { handle } });
    if (!user) throw new NotFoundException('No Atlas user with that handle.');

    const account =
      (await this.accounts.findOne({ where: { userId: user.id, currency: 'EUR', status: 'active' } })) ||
      (await this.accounts.findOne({ where: { userId: user.id, status: 'active' } }));
    if (!account) throw new NotFoundException('This user cannot receive payments yet.');

    return {
      handle,
      name: `${user.firstName} ${user.lastName}`.trim(),
      iban: account.iban,
      bic: account.bic,
    };
  }
}
