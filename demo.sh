#!/bin/bash

# Demo script for Mini Payment Gateway Proxy
echo "🚀 Mini Payment Gateway Proxy API Demo"
echo "======================================"

# Start the server in the background
echo "📡 Starting server..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo ""
echo "🧪 Testing API Endpoints:"
echo "========================"

# Test 1: Low risk transaction (should route to Stripe)
echo ""
echo "📋 Test 1: Low risk transaction"
echo "POST /api/chargeRequest - Small amount, safe domain"
curl -s -X POST http://localhost:3001/api/chargeRequest \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "currency": "USD", 
    "source": "tok_test",
    "email": "user@example.com"
  }' | jq '.'

# Test 2: Medium risk transaction (should route to PayPal)
echo ""
echo "📋 Test 2: Medium risk transaction" 
echo "POST /api/chargeRequest - Large amount, safe domain"
curl -s -X POST http://localhost:3001/api/chargeRequest \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500,
    "currency": "USD",
    "source": "tok_test", 
    "email": "user@safe.com"
  }' | jq '.'

# Test 3: High risk transaction (should be rejected)
echo ""
echo "📋 Test 3: High risk transaction"
echo "POST /api/chargeRequest - Large amount, suspicious domain"
curl -s -X POST http://localhost:3001/api/chargeRequest \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "currency": "USD",
    "source": "tok_test",
    "email": "fraud@test.com"
  }' | jq '.'

# Test 4: Validation error
echo ""
echo "📋 Test 4: Validation error"
echo "POST /api/chargeRequest - Missing required fields"
curl -s -X POST http://localhost:3001/api/chargeRequest \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100
  }' | jq '.'

# Test 5: Get all transactions
echo ""
echo "📋 Test 5: Get transaction history"
echo "GET /api/transactions"
curl -s -X GET http://localhost:3001/api/transactions | jq '.'

echo ""
echo "✅ Demo completed!"
echo ""
echo "💡 Note: LLM explanations will show 'Explanation generation failed.'"
echo "   Add a real OpenAI API key to .env for full functionality."

# Stop the server
kill $SERVER_PID
echo ""
echo "🛑 Server stopped."