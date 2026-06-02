import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity, AccountEntity, TransactionEntity, UserEntity } from '@/database/entities';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { ProvidersModule } from '@/providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CardEntity, AccountEntity, TransactionEntity, UserEntity]),
    ProvidersModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
