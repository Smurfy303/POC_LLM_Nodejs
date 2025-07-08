"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fraud_1 = require("./logic/fraud");
const provider_1 = require("./logic/provider");
const llm_1 = require("./logic/llm");
const store_1 = require("./store");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
function validateChargeRequest(req, res, next) {
    const { amount, email } = req.body;
    if (!amount || !email) {
        return res.status(400).json({
            error: 'amount and email are required',
            code: 'MISSING_FIELDS'
        });
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
            error: 'amount must be a positive number',
            code: 'INVALID_AMOUNT'
        });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            error: 'email must be a valid email address',
            code: 'INVALID_EMAIL'
        });
    }
    next();
}
router.post('/charge', validateChargeRequest, async (req, res) => {
    const startTime = Date.now();
    const { amount, email } = req.body;
    try {
        const riskScore = (0, fraud_1.calculateFraudRisk)(amount, email);
        const provider = (0, provider_1.selectProvider)(riskScore);
        const status = provider ? 'success' : 'rejected';
        const explanation = await (0, llm_1.generateExplanation)(amount, email, riskScore, provider);
        const transactionId = `txn_${(0, uuid_1.v4)().slice(0, 8)}`;
        const transaction = {
            transactionId,
            timestamp: new Date().toISOString(),
            email,
            amount,
            provider,
            riskScore: parseFloat(riskScore.toFixed(2)),
            status
        };
        (0, store_1.logTransaction)(transaction);
        const responseTime = Date.now() - startTime;
        return res.status(provider ? 200 : 403).json({
            transactionId,
            provider,
            status,
            riskScore: transaction.riskScore,
            explanation,
            metadata: {
                responseTime: `${responseTime}ms`,
                timestamp: transaction.timestamp
            }
        });
    }
    catch (error) {
        console.error('Error processing charge:', error);
        return res.status(500).json({
            error: 'Internal server error',
            code: 'PROCESSING_ERROR'
        });
    }
});
router.get('/transactions', (req, res) => {
    const { email, limit } = req.query;
    const maxLimit = 1000;
    const requestedLimit = limit ? Math.min(parseInt(limit, 10) || 100, maxLimit) : 100;
    try {
        let transactions;
        if (email && typeof email === 'string') {
            transactions = (0, store_1.getTransactionsByEmail)(email);
        }
        else {
            transactions = (0, store_1.getAllTransactions)();
        }
        const limitedTransactions = transactions
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, requestedLimit);
        res.status(200).json({
            transactions: limitedTransactions,
            metadata: {
                count: limitedTransactions.length,
                total: transactions.length,
                limit: requestedLimit,
                filtered: !!email
            }
        });
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            error: 'Internal server error',
            code: 'FETCH_ERROR'
        });
    }
});
router.get('/metrics', (_req, res) => {
    const memoryUsage = process.memoryUsage();
    const storeMetrics = (0, store_1.getMemoryUsage)();
    res.status(200).json({
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
        },
        store: {
            transactionCount: storeMetrics.transactionCount,
            emailIndexSize: storeMetrics.emailIndexSize
        },
        nodejs: {
            version: process.version,
            platform: process.platform,
            arch: process.arch
        }
    });
});
exports.default = router;
