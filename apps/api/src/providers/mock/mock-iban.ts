/**
 * Generates a plausible-looking (not bank-real) German EUR IBAN for local dev.
 * Length and shape match a real DE IBAN so UI formatting/validation behaves.
 */
export function generateMockIban(): string {
  let digits = '';
  for (let i = 0; i < 20; i++) digits += Math.floor(Math.random() * 10);
  return `DE${digits}`;
}
