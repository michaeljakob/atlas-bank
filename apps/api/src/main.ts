import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { isAuthBypassEnabled } from './common/guards/auth.guard';
import { initSentry } from './common/observability/sentry';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  initSentry();

  // Fail fast on missing critical secrets in production.
  if (process.env.NODE_ENV === 'production') {
    const required = ['JWT_SECRET', 'DATABASE_URL', 'ENCRYPTION_KEY'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
      throw new Error(`Missing required env vars in production: ${missing.join(', ')}`);
    }
    if (process.env.SKIP_AUTH === 'true') {
      logger.warn('SKIP_AUTH=true is ignored in production builds');
    }
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // Structured JSON logging (pino) with redaction of sensitive fields.
    new FastifyAdapter({
      logger: {
        level: process.env.LOG_LEVEL || 'info',
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
        ],
      },
    }),
    // rawBody enables HMAC verification of webhook payloads (req.rawBody).
    { rawBody: true },
  );

  await app.register(fastifyCookie as any);
  await app.register(fastifyHelmet as any, { contentSecurityPolicy: false });

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Atlas Bank API')
    .setDescription('Atlas Bank BFF / API Gateway')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  if (isAuthBypassEnabled()) {
    logger.warn('SKIP_AUTH is enabled — all routes are unauthenticated (development only)');
  }

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Atlas API listening on :${port}`);
}

bootstrap();
