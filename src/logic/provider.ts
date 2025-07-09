export type Provider = 'stripe' | 'paypal' | null;

export function selectProvider(score: number): Provider {
  if (score >= 0.5) return null; // Block submission if score >= 0.5
  if (score < 0.25) return 'stripe'; // Route low risk to Stripe
  return 'paypal'; // Route medium risk to PayPal
}
