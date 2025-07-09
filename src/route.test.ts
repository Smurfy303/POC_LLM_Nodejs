import request from 'supertest';
import express from 'express';
import router from './route'; 
jest.useFakeTimers();

// Mock dependencies
jest.mock('../src/logic/fraud', () => ({
  calculateFraudRisk: jest.fn(() => 0.2)
}));

jest.mock('../src/logic/provider', () => ({
  selectProvider: jest.fn(() => 'stripe')
}));

jest.mock('../src/logic/llm', () => ({
  generateExplanation: jest.fn(() => Promise.resolve('Test explanation'))
}));

jest.mock('../src/store', () => {
  const log: any[] = [];
  return {
    getAllTransactions: jest.fn(() => log),
    logTransaction: jest.fn(txn => log.push(txn)),
    Transaction: jest.requireActual('../src/store').Transaction
  };
});

// Setup app with JSON parsing
const app = express();
app.use(express.json());
app.use(router);

afterAll(() => {
  jest.clearAllMocks();
});

describe('POST /chargeRequest', () => {
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/chargeRequest').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    
    // Test partial data
    const res2 = await request(app).post('/chargeRequest').send({
      amount: 100,
      email: 'test@example.com'
    });
    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty('error');
  });

  it('should return 200 with success when fraud score is low', async () => {
    const res = await request(app).post('/chargeRequest').send({
      amount: 500,
      currency: 'USD',
      source: 'tok_test',
      email: 'test@example.com'
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('transactionId');
    expect(res.body.provider).toBe('stripe');
    expect(res.body.status).toBe('success');
    expect(res.body.riskScore).toBeCloseTo(0.2);
    expect(res.body.explanation).toBe('Test explanation');
  });

  it('should return 403 when fraud score is high and provider is null', async () => {
    const { calculateFraudRisk } = require('../src/logic/fraud');
    const { selectProvider } = require('../src/logic/provider');

    calculateFraudRisk.mockReturnValueOnce(0.9);
    selectProvider.mockReturnValueOnce(null);

    const res = await request(app).post('/chargeRequest').send({
      amount: 5000,
      currency: 'USD', 
      source: 'tok_test',
      email: 'fraud@test.com'
    });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('rejected');
    expect(res.body.provider).toBeNull();
  });
});

describe('GET /transactions', () => {
  it('should return 200 or 201 depending on if transactions exist', async () => {
    const res1 = await request(app).get('/transactions');
    expect([200, 201]).toContain(res1.status);
    expect(Array.isArray(res1.body)).toBe(true);

    // Add a transaction
    await request(app).post('/chargeRequest').send({
      amount: 100,
      currency: 'USD',
      source: 'tok_test', 
      email: 'get@test.com'
    });

    const res2 = await request(app).get('/transactions');
    expect(res2.status).toBe(201);
    expect(res2.body.length).toBeGreaterThan(0);
  });
});
