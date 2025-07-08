import {  Router } from 'express';
import { calculateFraudRisk } from './logic/fraud';
import { selectProvider } from './logic/provider';
import { generateExplanation } from './logic/llm';
import { getAllTransactions, logTransaction, Transaction, getTransactionsByEmail, getMemoryUsage } from './store';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Input validation middleware
function validateChargeRequest(req: any, res: any, next: any) {
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

router.post('/charge', validateChargeRequest, async (req, res): Promise<any> => {
  const startTime = Date.now();
  const { amount, email } = req.body;

  try {
    const riskScore = calculateFraudRisk(amount, email);
    const provider = selectProvider(riskScore);
    const status = provider ? 'success' : 'rejected';

    // Generate explanation (now non-blocking)
    const explanation = await generateExplanation(amount, email, riskScore, provider);

    const transactionId = `txn_${uuidv4().slice(0, 8)}`;

    const transaction: Transaction = {
      transactionId,
      timestamp: new Date().toISOString(),
      email,
      amount,
      provider,
      riskScore: parseFloat(riskScore.toFixed(2)),
      status
    };

    logTransaction(transaction);

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
  } catch (error) {
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
  const requestedLimit = limit ? Math.min(parseInt(limit as string, 10) || 100, maxLimit) : 100;

  try {
    let transactions: Transaction[];
    
    if (email && typeof email === 'string') {
      transactions = getTransactionsByEmail(email);
    } else {
      transactions = getAllTransactions();
    }

    // Apply limit and sort by most recent first
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
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'FETCH_ERROR'
    });
  }
});

// Performance monitoring endpoint
router.get('/metrics', (_req, res) => {
  const memoryUsage = process.memoryUsage();
  const storeMetrics = getMemoryUsage();
  
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

export default router;
