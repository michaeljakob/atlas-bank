import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity, UserEntity } from '@/database/entities';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ProvidersModule } from '@/providers/providers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity, UserEntity]),
    ProvidersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
