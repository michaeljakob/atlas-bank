import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity, TransactionEntity } from '@/database/entities';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { ProvidersModule } from '@/providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity, TransactionEntity]),
    ProvidersModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
