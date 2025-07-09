"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fraud_1 = require("./logic/fraud");
const provider_1 = require("./logic/provider");
const llm_1 = require("./logic/llm");
const store_1 = require("./store");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
router.post('/chargeRequest', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, currency, source, email } = req.body;
    if (!amount || !currency || !source || !email) {
        return res.status(400).json({ error: 'amount, currency, source, and email are required' });
    }
    const riskScore = (0, fraud_1.calculateFraudRisk)(amount, email);
    const provider = (0, provider_1.selectProvider)(riskScore);
    const status = provider ? 'success' : 'rejected';
    const explanation = yield (0, llm_1.generateExplanation)(amount, email, riskScore, provider);
    const transactionId = `txn_${(0, uuid_1.v4)().slice(0, 8)}`;
    const transaction = {
        transactionId,
        timestamp: new Date().toISOString(),
        email,
        amount,
        currency,
        source,
        provider,
        riskScore: parseFloat(riskScore.toFixed(2)),
        status
    };
    (0, store_1.logTransaction)(transaction);
    return res.status(provider ? 200 : 403).json({
        transactionId,
        provider,
        status,
        riskScore: transaction.riskScore,
        explanation
    });
}));
router.get('/transactions', (req, res) => {
    const transactions = (0, store_1.getAllTransactions)();
    if (transactions.length) {
        res.status(201).json(transactions);
    }
    else {
        res.status(200).json(transactions);
    }
});
exports.default = router;
//# sourceMappingURL=route.js.map