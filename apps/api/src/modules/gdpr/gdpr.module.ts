import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  UserEntity,
  AccountEntity,
  CardEntity,
  TransactionEntity,
  RecipientEntity,
  PaymentRequestEntity,
  OnboardingEntity,
  NotificationEntity,
} from '@/database/entities';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';
import { ProvidersModule } from '@/providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AccountEntity,
      CardEntity,
      TransactionEntity,
      RecipientEntity,
      PaymentRequestEntity,
      OnboardingEntity,
      NotificationEntity,
    ]),
    ProvidersModule,
  ],
  controllers: [GdprController],
  providers: [GdprService],
})
export class GdprModule {}
