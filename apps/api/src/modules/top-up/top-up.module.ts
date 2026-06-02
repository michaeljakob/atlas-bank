import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity, TransactionEntity } from '@/database/entities';
import { TopUpController } from './top-up.controller';
import { TopUpService } from './top-up.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, TransactionEntity])],
  controllers: [TopUpController],
  providers: [TopUpService],
})
export class TopUpModule {}
