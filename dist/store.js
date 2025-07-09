"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTransactions = exports.logTransaction = void 0;
const log = [];
function logTransaction(txn) {
    log.push(txn);
}
exports.logTransaction = logTransaction;
function getAllTransactions() {
    return log;
}
exports.getAllTransactions = getAllTransactions;
//# sourceMappingURL=store.js.map