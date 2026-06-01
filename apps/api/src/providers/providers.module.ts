import { Module } from '@nestjs/common';
import { SwanModule } from './swan/swan.module';

export const ONBOARDING_PROVIDER = 'ONBOARDING_PROVIDER';
export const ACCOUNT_PROVIDER = 'ACCOUNT_PROVIDER';
export const CARD_PROVIDER = 'CARD_PROVIDER';
export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

@Module({
  imports: [SwanModule],
  exports: [SwanModule],
})
export class ProvidersModule {}
