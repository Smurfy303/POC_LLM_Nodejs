export interface Transaction {
  transactionId: string;
  timestamp: string;
  email: string;
  amount: number;
  provider: string | null;
  riskScore: number;
  status: "success" | "rejected";
}

// Configuration
const MAX_TRANSACTIONS = 10000; // Limit memory usage
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

const log: Transaction[] = [];
const emailIndex = new Map<string, Transaction[]>(); // Index by email for faster lookups

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const cutoff = now - MAX_AGE;
  
  // Remove old transactions
  const initialLength = log.length;
  for (let i = log.length - 1; i >= 0; i--) {
    const txn = log[i];
    if (!txn) continue;
    
    const txnTime = new Date(txn.timestamp).getTime();
    if (txnTime < cutoff) {
      const removed = log.splice(i, 1)[0];
      if (!removed) continue;
      
      // Remove from email index
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
  
  // If still too many, remove oldest
  if (log.length > MAX_TRANSACTIONS) {
    const excess = log.length - MAX_TRANSACTIONS;
    const removed = log.splice(0, excess);
    // Update email index
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

export function logTransaction(txn: Transaction): void {
  log.push(txn);
  
  // Update email index
  if (!emailIndex.has(txn.email)) {
    emailIndex.set(txn.email, []);
  }
  emailIndex.get(txn.email)!.push(txn);
}

export function getAllTransactions(): Transaction[] {
  return [...log]; // Return copy to prevent external modification
}

export function getTransactionsByEmail(email: string): Transaction[] {
  return emailIndex.get(email) || [];
}

export function getTransactionCount(): number {
  return log.length;
}

export function getMemoryUsage(): { transactionCount: number; emailIndexSize: number } {
  return {
    transactionCount: log.length,
    emailIndexSize: emailIndex.size
  };
}
