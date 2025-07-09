export interface Transaction {
  transactionId: string;
  timestamp: string;
  email: string;
  amount: number;
  currency: string;
  source: string;
  provider: string | null;
  riskScore: number;
  status: "success" | "rejected";
}

const log: Transaction[] = [];

export function logTransaction(txn: Transaction) {
  log.push(txn);
}

export function getAllTransactions(): Transaction[] {
  return log;
}
