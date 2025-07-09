# Mini Payment Gateway Proxy with LLM Risk Summary

A lightweight backend API that simulates routing payment requests to Stripe or PayPal based on fraud risk scoring, with AI-generated explanations.

## Features

- 🔄 **Smart Payment Routing**: Routes payments to Stripe or PayPal based on fraud risk scores
- 🤖 **AI Risk Explanations**: Uses OpenAI GPT to generate human-readable risk assessments  
- 🛡️ **Fraud Detection**: Heuristic-based fraud scoring considering amount and email domain
- 📊 **Transaction Logging**: In-memory storage of all transaction metadata
- ✅ **Full Test Coverage**: Comprehensive unit tests for all components
- 🔧 **TypeScript**: Modern TypeScript implementation with strict typing

## Risk Scoring Logic

The system evaluates fraud risk using these heuristics:
- **Base Score**: 0.1
- **Large Amount**: +0.4 (if amount > $1000)
- **Suspicious Domain**: +0.4 (if email contains `.ru`, `.cn`, or `test.com`)
- **Random Noise**: ±0.1 (to simulate real-world variance)

## Payment Routing

- **Risk Score < 0.25**: Routes to Stripe (low risk)
- **Risk Score 0.25-0.49**: Routes to PayPal (medium risk)  
- **Risk Score ≥ 0.5**: Blocks transaction (high risk)

## Setup

### Prerequisites

- Node.js 16+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### POST /api/chargeRequest

Process a payment request with fraud risk assessment.

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "USD", 
  "source": "tok_test",
  "email": "donor@example.com"
}
```

**Success Response (200):**
```json
{
  "transactionId": "txn_abc123",
  "provider": "paypal",
  "status": "success", 
  "riskScore": 0.32,
  "explanation": "This payment was routed to PayPal due to a moderate risk score based on the transaction amount and email domain analysis."
}
```

**Rejected Response (403):**
```json
{
  "transactionId": "txn_def456",
  "provider": null,
  "status": "rejected",
  "riskScore": 0.75, 
  "explanation": "This payment was blocked due to high fraud risk indicators including a large amount and suspicious email domain."
}
```

**Validation Error (400):**
```json
{
  "error": "amount, currency, source, and email are required"
}
```

### GET /api/transactions

Retrieve all processed transactions.

**Response (200/201):**
```json
[
  {
    "transactionId": "txn_abc123",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "email": "user@example.com",
    "amount": 1000,
    "currency": "USD",
    "source": "tok_test", 
    "provider": "paypal",
    "riskScore": 0.32,
    "status": "success"
  }
]
```

## Testing

Run the full test suite:
```bash
npm test
```

The tests cover:
- ✅ Fraud risk calculation logic
- ✅ Payment provider selection  
- ✅ LLM explanation generation
- ✅ Transaction logging
- ✅ API endpoint validation and responses

## Project Structure

```
src/
├── app.ts              # Express app setup and server
├── route.ts            # API route handlers  
├── store.ts            # In-memory transaction storage
└── logic/
    ├── fraud.ts        # Fraud risk calculation
    ├── provider.ts     # Payment provider selection
    └── llm.ts          # OpenAI integration
```

## Configuration

Environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for generating explanations | Required |
| `PORT` | Server port | 3001 |

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Testing**: Jest + Supertest
- **AI Integration**: OpenAI GPT-4o-mini
- **HTTP Client**: Axios

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production server |
| `npm test` | Run test suite |

## License

ISC