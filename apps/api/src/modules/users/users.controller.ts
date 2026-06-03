import { Controller, Get, Patch, Body, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, AccountEntity } from '@/database/entities';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: any) {
    const userId = req.user?.id || 'dev-user';
    const user = await this.userRepo.findOne({ where: { id: userId } });

    const account = await this.accountRepo.findOne({
      where: { userId, currency: 'EUR' },
    });

    return {
      id: user?.id,
      email: user?.email,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || null,
      dateOfBirth: user?.dateOfBirth || null,
      nationality: user?.nationality || null,
      residenceCountry: user?.residenceCountry || null,
      residenceAddress: user?.residenceAddress || null,
      handle: user?.handle || null,
      emailVerified: user?.emailVerified ?? false,
      createdAt: user?.createdAt,
      account: account
        ? {
            id: account.id,
            iban: account.iban,
            bic: account.bic,
            status: account.status,
            createdAt: account.createdAt,
          }
        : null,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile fields' })
  async updateProfile(
    @Req() req: any,
    @Body() dto: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      dateOfBirth?: string;
      nationality?: string;
      residenceCountry?: string;
      residenceAddress?: { line1: string; line2?: string; city: string; postalCode: string; country: string };
    },
  ) {
    const userId = req.user?.id || 'dev-user';
    const patch: Partial<UserEntity> = {};

    if (dto.firstName !== undefined) patch.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) patch.lastName = dto.lastName.trim();
    if (dto.email !== undefined) patch.email = dto.email.trim().toLowerCase();
    if (dto.phone !== undefined) patch.phone = dto.phone.trim() || undefined;
    if (dto.dateOfBirth !== undefined) patch.dateOfBirth = dto.dateOfBirth.trim();
    if (dto.nationality !== undefined) patch.nationality = dto.nationality.trim();
    if (dto.residenceCountry !== undefined) patch.residenceCountry = dto.residenceCountry.trim();
    if (dto.residenceAddress) {
      if (!dto.residenceAddress.line1 || !dto.residenceAddress.city || !dto.residenceAddress.postalCode || !dto.residenceAddress.country) {
        throw new BadRequestException('line1, city, postalCode and country are required');
      }
      patch.residenceAddress = {
        line1: dto.residenceAddress.line1.trim(),
        line2: dto.residenceAddress.line2?.trim() || undefined,
        city: dto.residenceAddress.city.trim(),
        postalCode: dto.residenceAddress.postalCode.trim(),
        country: dto.residenceAddress.country.trim(),
      };
    }

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    await this.userRepo.update(userId, patch);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return {
      id: user?.id,
      email: user?.email,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || null,
      dateOfBirth: user?.dateOfBirth || null,
      nationality: user?.nationality || null,
      residenceCountry: user?.residenceCountry || null,
      residenceAddress: user?.residenceAddress || null,
    };
  }
}
