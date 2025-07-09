"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectProvider = void 0;
function selectProvider(score) {
    if (score >= 0.5)
        return null; // Block submission if score >= 0.5
    if (score < 0.25)
        return 'stripe'; // Route low risk to Stripe
    return 'paypal'; // Route medium risk to PayPal
}
exports.selectProvider = selectProvider;
//# sourceMappingURL=provider.js.map