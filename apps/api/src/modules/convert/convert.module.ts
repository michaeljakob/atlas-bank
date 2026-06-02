import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRateEntity, AccountEntity, TransactionEntity } from '@/database/entities';
import { ConvertController } from './convert.controller';
import { ConvertService } from './convert.service';
import { FX_PROVIDER, FrankfurterProvider, CurrencyCloudProvider } from './providers';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRateEntity, AccountEntity, TransactionEntity])],
  controllers: [ConvertController],
  providers: [
    ConvertService,
    FrankfurterProvider,
    CurrencyCloudProvider,
    {
      provide: FX_PROVIDER,
      useFactory: (frankfurter: FrankfurterProvider, currencycloud: CurrencyCloudProvider) => {
        const provider = process.env.FX_PROVIDER ?? 'frankfurter';
        return provider === 'currencycloud' ? currencycloud : frankfurter;
      },
      inject: [FrankfurterProvider, CurrencyCloudProvider],
    },
  ],
  exports: [ConvertService],
})
export class ConvertModule {}
