"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("./store");
afterAll(() => {
    jest.clearAllMocks();
});
describe('Transaction Logger', () => {
    beforeEach(() => {
        // Clear the log array before each test by directly accessing and resetting it
        // We assume log is module-scoped and we clear it by calling `getAllTransactions().length = 0`
        const transactions = (0, store_1.getAllTransactions)();
        transactions.length = 0;
    });
    test('should log a transaction', () => {
        const txn = {
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
        (0, store_1.logTransaction)(txn);
        const allTxns = (0, store_1.getAllTransactions)();
        expect(allTxns).toHaveLength(1);
        expect(allTxns[0]).toEqual(txn);
    });
    test('should log multiple transactions', () => {
        const txn1 = {
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
        const txn2 = {
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
        (0, store_1.logTransaction)(txn1);
        (0, store_1.logTransaction)(txn2);
        const allTxns = (0, store_1.getAllTransactions)();
        expect(allTxns).toHaveLength(2);
        expect(allTxns).toContainEqual(txn1);
        expect(allTxns).toContainEqual(txn2);
    });
    test('getAllTransactions returns empty initially', () => {
        const allTxns = (0, store_1.getAllTransactions)();
        expect(allTxns).toEqual([]);
    });
});
//# sourceMappingURL=store.test.js.map