import { logTransaction, getAllTransactions, Transaction } from './store';

afterAll(() => {
  jest.clearAllMocks();
});

describe('Transaction Logger', () => {
  beforeEach(() => {
    // Clear the log array before each test by directly accessing and resetting it
    // We assume log is module-scoped and we clear it by calling `getAllTransactions().length = 0`
    const transactions = getAllTransactions();
    transactions.length = 0;
  });

  test('should log a transaction', () => {
    const txn: Transaction = {
      transactionId: 'txn_123',
      timestamp: new Date().toISOString(),
      email: 'user@example.com',
      amount: 500,
      currency: 'USD',
      source: 'tok_test',
      provider: 'Stripe',
      riskScore: 0.3,
      status: 'success',
    };

    logTransaction(txn);

    const allTxns = getAllTransactions();
    expect(allTxns).toHaveLength(1);
    expect(allTxns[0]).toEqual(txn);
  });

  test('should log multiple transactions', () => {
    const txn1: Transaction = {
      transactionId: 'txn_1',
      timestamp: new Date().toISOString(),
      email: 'a@example.com',
      amount: 100,
      currency: 'USD',
      source: 'tok_test',
      provider: 'Stripe',
      riskScore: 0.2,
      status: 'success',
    };

    const txn2: Transaction = {
      transactionId: 'txn_2',
      timestamp: new Date().toISOString(),
      email: 'b@example.com',
      amount: 1000,
      currency: 'USD',
      source: 'tok_test',
      provider: null,
      riskScore: 0.7,
      status: 'rejected',
    };

    logTransaction(txn1);
    logTransaction(txn2);

    const allTxns = getAllTransactions();
    expect(allTxns).toHaveLength(2);
    expect(allTxns).toContainEqual(txn1);
    expect(allTxns).toContainEqual(txn2);
  });

  test('getAllTransactions returns empty initially', () => {
    const allTxns = getAllTransactions();
    expect(allTxns).toEqual([]);
  });
});
