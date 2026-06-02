import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookEventEntity, OnboardingEntity, AccountEntity, TransactionEntity, UserEntity } from '@/database/entities';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { ProvidersModule } from '@/providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEventEntity, OnboardingEntity, AccountEntity, TransactionEntity, UserEntity]),
    ProvidersModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
