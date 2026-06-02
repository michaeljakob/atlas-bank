import { Module } from '@nestjs/common';
import { SwanModule } from './swan/swan.module';

export { ONBOARDING_PROVIDER, ACCOUNT_PROVIDER, CARD_PROVIDER, PAYMENT_PROVIDER } from './provider-tokens';

@Module({
  imports: [SwanModule],
  exports: [SwanModule],
})
export class ProvidersModule {}
