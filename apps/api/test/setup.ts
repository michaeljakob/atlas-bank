import 'reflect-metadata';

// Deterministic env for unit tests. No real Redis/DB/secrets required.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '3600';
process.env.REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '2592000';
// 32-byte hex key so PII encryption round-trips in tests.
process.env.ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
