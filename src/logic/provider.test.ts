import { selectProvider } from './provider';

afterAll(() => {
  jest.clearAllMocks();
});

describe('selectProvider', () => {
  test('returns "stripe" for score <= 0.3', () => {
    expect(selectProvider(0)).toBe('stripe');
    expect(selectProvider(0.1)).toBe('stripe');
    expect(selectProvider(0.3)).toBe('stripe');
  });

  test('returns "paypal" for 0.3 < score <= 0.7', () => {
    expect(selectProvider(0.31)).toBe('paypal');
    expect(selectProvider(0.5)).toBe('paypal');
    expect(selectProvider(0.7)).toBe('paypal');
  });

  test('returns null for score > 0.7', () => {
    expect(selectProvider(0.71)).toBeNull();
    expect(selectProvider(0.9)).toBeNull();
    expect(selectProvider(1)).toBeNull();
  });

  test('edge cases are handled correctly', () => {
    expect(selectProvider(0.300000001)).toBe('paypal'); // Just above 0.3
    expect(selectProvider(0.700000001)).toBeNull();     // Just above 0.7
  });
});
