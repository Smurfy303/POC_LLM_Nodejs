"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const provider_1 = require("./provider");
afterAll(() => {
    jest.clearAllMocks();
});
describe('selectProvider', () => {
    test('returns "stripe" for score < 0.25', () => {
        expect((0, provider_1.selectProvider)(0)).toBe('stripe');
        expect((0, provider_1.selectProvider)(0.1)).toBe('stripe');
        expect((0, provider_1.selectProvider)(0.24)).toBe('stripe');
    });
    test('returns "paypal" for 0.25 <= score < 0.5', () => {
        expect((0, provider_1.selectProvider)(0.25)).toBe('paypal');
        expect((0, provider_1.selectProvider)(0.3)).toBe('paypal');
        expect((0, provider_1.selectProvider)(0.49)).toBe('paypal');
    });
    test('returns null for score >= 0.5', () => {
        expect((0, provider_1.selectProvider)(0.5)).toBeNull();
        expect((0, provider_1.selectProvider)(0.7)).toBeNull();
        expect((0, provider_1.selectProvider)(0.9)).toBeNull();
        expect((0, provider_1.selectProvider)(1)).toBeNull();
    });
    test('edge cases are handled correctly', () => {
        expect((0, provider_1.selectProvider)(0.250000001)).toBe('paypal'); // Just above 0.25
        expect((0, provider_1.selectProvider)(0.499999999)).toBe('paypal'); // Just below 0.5
        expect((0, provider_1.selectProvider)(0.500000001)).toBeNull(); // Just above 0.5
    });
});
//# sourceMappingURL=provider.test.js.map