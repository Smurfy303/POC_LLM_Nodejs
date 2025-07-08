"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemoryUsage = exports.getTransactionCount = exports.getTransactionsByEmail = exports.getAllTransactions = exports.logTransaction = void 0;
const MAX_TRANSACTIONS = 10000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;
const MAX_AGE = 24 * 60 * 60 * 1000;
const log = [];
const emailIndex = new Map();
setInterval(() => {
    const now = Date.now();
    const cutoff = now - MAX_AGE;
    const initialLength = log.length;
    for (let i = log.length - 1; i >= 0; i--) {
        const txn = log[i];
        if (!txn)
            continue;
        const txnTime = new Date(txn.timestamp).getTime();
        if (txnTime < cutoff) {
            const removed = log.splice(i, 1)[0];
            if (!removed)
                continue;
            const emailTxns = emailIndex.get(removed.email);
            if (emailTxns) {
                const index = emailTxns.findIndex(t => t.transactionId === removed.transactionId);
                if (index !== -1) {
                    emailTxns.splice(index, 1);
                }
                if (emailTxns.length === 0) {
                    emailIndex.delete(removed.email);
                }
            }
        }
    }
    if (log.length > MAX_TRANSACTIONS) {
        const excess = log.length - MAX_TRANSACTIONS;
        const removed = log.splice(0, excess);
        removed.forEach(txn => {
            const emailTxns = emailIndex.get(txn.email);
            if (emailTxns) {
                const index = emailTxns.findIndex(t => t.transactionId === txn.transactionId);
                if (index !== -1) {
                    emailTxns.splice(index, 1);
                }
                if (emailTxns.length === 0) {
                    emailIndex.delete(txn.email);
                }
            }
        });
    }
    const cleaned = initialLength - log.length;
    if (cleaned > 0) {
        console.log(`Cleaned ${cleaned} old transactions. Current count: ${log.length}`);
    }
}, CLEANUP_INTERVAL);
function logTransaction(txn) {
    log.push(txn);
    if (!emailIndex.has(txn.email)) {
        emailIndex.set(txn.email, []);
    }
    emailIndex.get(txn.email).push(txn);
}
exports.logTransaction = logTransaction;
function getAllTransactions() {
    return [...log];
}
exports.getAllTransactions = getAllTransactions;
function getTransactionsByEmail(email) {
    return emailIndex.get(email) || [];
}
exports.getTransactionsByEmail = getTransactionsByEmail;
function getTransactionCount() {
    return log.length;
}
exports.getTransactionCount = getTransactionCount;
function getMemoryUsage() {
    return {
        transactionCount: log.length,
        emailIndexSize: emailIndex.size
    };
}
exports.getMemoryUsage = getMemoryUsage;
