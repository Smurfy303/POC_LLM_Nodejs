"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fraud_1 = require("./fraud");
afterAll(() => {
    jest.clearAllMocks();
});
describe('calculateFraudRisk', () => {
    const originalMathRandom = Math.random;
    afterEach(() => {
        Math.random = originalMathRandom; // restore after each test
    });
    test('returns base score for safe input (amount <= 1000, safe email)', () => {
        Math.random = () => 0; // noise = -0.1
        const result = (0, fraud_1.calculateFraudRisk)(500, 'user@example.com');
        expect(result).toBeCloseTo(0.0, 1);
    });
    test('adds 0.4 for amount > 1000', () => {
        Math.random = () => 0.5; // noise = 0
        const result = (0, fraud_1.calculateFraudRisk)(1500, 'user@example.com');
        expect(result).toBeCloseTo(0.5, 1);
    });
    test('adds 0.4 for suspicious email domain', () => {
        Math.random = () => 0.5; // noise = 0
        const result = (0, fraud_1.calculateFraudRisk)(500, 'user@test.com');
        expect(result).toBeCloseTo(0.5, 1);
    });
    test('adds 0.4 + 0.4 for both suspicious domain and high amount', () => {
        Math.random = () => 1.0; // noise = 0.1
        const result = (0, fraud_1.calculateFraudRisk)(2000, 'user@abc.ru');
        expect(result).toBeCloseTo(1.0, 1); // capped at 1
    });
    test('result is clamped to max 1', () => {
        Math.random = () => 1.0; // noise = 0.1
        const result = (0, fraud_1.calculateFraudRisk)(2000, 'user@test.com');
        expect(result).toBeLessThanOrEqual(1);
    });
    test('result is clamped to min 0', () => {
        Math.random = () => 0.0; // noise = -0.1
        const result = (0, fraud_1.calculateFraudRisk)(0, 'user@safe.com');
        expect(result).toBeGreaterThanOrEqual(0);
    });
    test('handles malformed emails gracefully', () => {
        Math.random = () => 0.5;
        const result = (0, fraud_1.calculateFraudRisk)(500, 'invalidEmail');
        expect(result).toBeCloseTo(0.1, 1);
    });
});
//# sourceMappingURL=fraud.test.js.map