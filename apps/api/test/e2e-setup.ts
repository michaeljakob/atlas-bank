import 'reflect-metadata';

// Boot the app in dev auth-bypass mode: in-memory SQLite, seeded dev-user,
// no real secrets/Redis/Swan required. NODE_ENV stays non-production so the
// SKIP_AUTH gate is allowed to take effect.
process.env.NODE_ENV = 'test';
process.env.SKIP_AUTH = 'true';
process.env.JWT_SECRET = 'test-secret';
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.LOG_LEVEL = 'silent';
