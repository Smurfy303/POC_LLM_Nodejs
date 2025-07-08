"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectProvider = void 0;
function selectProvider(score) {
    if (score <= 0.3)
        return 'stripe';
    if (score <= 0.7)
        return 'paypal';
    return null;
}
exports.selectProvider = selectProvider;
