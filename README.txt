🚀 Assignment Name : Mid-Level Problem 1: Mini Payment Gateway Proxy with LLM Risk Summary

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
OpenAI API (gpt-4o-mini)
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
1. Download the .zip file from github portal
    - Extract the files
    - Go to POC_LLM_Nodejs-main
    - npm install

-------- OR ----------
1. Clone and install
    git clone git@github.com:Smurfy303/POC_LLM_Nodejs.git
    cd POC_LLM_Nodejs
    npm install


🚀 Run the Project
In Terminal run below commands,
    - npm run build
    - npm start    


