import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { CardsModule } from './modules/cards/cards.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { RecipientsModule } from './modules/recipients/recipients.module';
import { JarsModule } from './modules/jars/jars.module';
import { PaymentRequestsModule } from './modules/payment-requests/payment-requests.module';
import { ConvertModule } from './modules/convert/convert.module';
import { HandlesModule } from './modules/handles/handles.module';
import { HealthModule } from './modules/health/health.module';
import { TopUpModule } from './modules/top-up/top-up.module';
import { GdprModule } from './modules/gdpr/gdpr.module';
import { EmailModule } from './modules/email/email.module';
import { DevSeederModule } from './modules/seed/dev-seeder.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { CacheModule } from './common/cache/cache.module';
import { AuthGuard, isAuthBypassEnabled } from './common/guards/auth.guard';
import { AdminGuard } from './common/guards/admin.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import swanConfig from './config/swan.config';
import { ALL_ENTITIES } from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, swanConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        // In-memory DB only for the dev auth-bypass mode; never in production.
        if (isAuthBypassEnabled()) {
          return {
            type: 'better-sqlite3',
            database: ':memory:',
            entities: ALL_ENTITIES,
            synchronize: true,
          };
        }

        const url = process.env.DATABASE_URL;
        const isDev = config.get('app.env') === 'development';
        return {
          type: 'postgres',
          ...(url
            ? { url }
            : {
                host: config.get<string>('database.host'),
                port: config.get<number>('database.port'),
                username: config.get<string>('database.username'),
                password: config.get<string>('database.password'),
                database: config.get<string>('database.name'),
              }),
          entities: ALL_ENTITIES,
          // Schema is owned by migrations; never auto-synchronize.
          synchronize: false,
          migrationsRun: true,
          migrations: [__dirname + '/database/migrations/*.{js,ts}'],
          logging: isDev,
          // SSL for managed Postgres (e.g. Supabase). Always on in production
          // when using DATABASE_URL; opt-in elsewhere via DB_SSL=true.
          ...(process.env.DB_SSL === 'true' ||
          (url && config.get('app.env') === 'production')
            ? { ssl: { rejectUnauthorized: false } }
            : {}),
        } as TypeOrmModuleOptions;
      },
    }),
    ScheduleModule.forRoot(),
    CacheModule,
    EmailModule,
    ProvidersModule,
    AuthModule,
    OnboardingModule,
    AccountsModule,
    CardsModule,
    PaymentsModule,
    WebhooksModule,
    RecipientsModule,
    JarsModule,
    PaymentRequestsModule,
    ConvertModule,
    HandlesModule,
    HealthModule,
    TopUpModule,
    GdprModule,
    AdminModule,
    UsersModule,
    DevSeederModule,
  ],
  providers: [
    // AuthGuard runs first and populates request.user; AdminGuard then
    // authorizes @AdminOnly() routes based on the resolved role.
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
