import {  Router } from 'express';
import { calculateFraudRisk } from './logic/fraud';
import { selectProvider } from './logic/provider';
import { generateExplanation } from './logic/llm';
import { getAllTransactions, logTransaction, Transaction } from './store';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/charge', async (req, res): Promise<any> => {
  const { amount, email } = req.body;

  if (!amount || !email) {
    return res.status(400).json({ error: 'amount and email are required' });
  }

  const riskScore = calculateFraudRisk(amount, email);
  const provider = selectProvider(riskScore);

  const status = provider ? 'success' : 'rejected';

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

  return res.status(provider ? 200 : 403).json({
    transactionId,
    provider,
    status,
    riskScore: transaction.riskScore,
    explanation
  });
});

router.get('/transactions', (req, res) => {
  const transactions = getAllTransactions();
  if(transactions.length){
    res.status(201).json(transactions);
  }else{
    res.status(200).json(transactions);
  }
});

export default router;
