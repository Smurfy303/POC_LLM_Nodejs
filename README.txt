🚀 Features
⚠️ Calculates fraud risk using:
1. Large amount detection
2. Suspicious email domains (.ru, test.com, etc.)
3. 🔀 Routes to Stripe, PayPal, or rejects the payment
4. 🤖 Generates explanations via OpenAI GPT
5. 🧠 Logs all transactions in memory with metadata + timestamp
6. 🧪 Written in TypeScript using modern structure

📦 Tech Stack
Node.js + Express
TypeScript
OpenAI API (GPT-3.5)
Docker (multi-stage build)
In-memory transaction store

📂 Project Structure
src/
├── app.ts               # Express app entry point
├── routes.ts            # API routes
├── logic/
│   ├── fraud.ts         # Fraud score logic
│   ├── provider.ts      # Routing logic
│   └── llm.ts           # OpenAI integration
└── store.ts             # In-memory log store

🔐 Environment Variables (.env)
Create a .env file in the root:

    OPENAI_API_KEY=your_openai_api_key
    PORT=3000

🛠️ Setup
1. Clone and install
    git clone https://github.com/your-repo/payment-router.git
    cd payment-router
    npm install

2. Build & run
    npm run build
    npm start


