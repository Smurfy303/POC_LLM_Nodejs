export type Provider = 'stripe' | 'paypal' | null;

export function selectProvider(score: number): Provider {
  if (score <= 0.3) return 'stripe';
  if (score <= 0.7) return 'paypal';
  return null;
}
