"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateExplanation = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const explanationCache = new Map();
const CACHE_TTL = 60 * 60 * 1000;
const cacheTimestamps = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of cacheTimestamps.entries()) {
        if (now - timestamp > CACHE_TTL) {
            explanationCache.delete(key);
            cacheTimestamps.delete(key);
        }
    }
}, 10 * 60 * 1000);
function generateCacheKey(amount, email, score, provider) {
    return `${amount}-${email.split('@')[1]}-${score.toFixed(1)}-${provider}`;
}
function getDefaultExplanation(amount, score, provider) {
    if (provider) {
        return `Payment of $${amount} processed via ${provider} (risk score: ${score.toFixed(2)})`;
    }
    else {
        return `Payment of $${amount} rejected due to high fraud risk (score: ${score.toFixed(2)})`;
    }
}
async function generateExplanation(amount, email, score, provider) {
    const cacheKey = generateCacheKey(amount, email, score, provider);
    if (explanationCache.has(cacheKey)) {
        return explanationCache.get(cacheKey);
    }
    const defaultExplanation = getDefaultExplanation(amount, score, provider);
    generateEnhancedExplanation(amount, email, score, provider, cacheKey)
        .catch(error => {
        console.warn('Background LLM call failed:', error.message);
    });
    return defaultExplanation;
}
exports.generateExplanation = generateExplanation;
async function generateEnhancedExplanation(amount, email, score, provider, cacheKey) {
    const prompt = provider
        ? `This payment of $${amount} from ${email} was routed to ${provider} due to a fraud risk score of ${score.toFixed(2)}. Write a short, professional explanation.`
        : `This payment of $${amount} from ${email} was rejected due to a fraud risk score of ${score.toFixed(2)}. Explain why.`;
    try {
        const res = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
            temperature: 0.7
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        const enhancedExplanation = res.data.choices[0].message.content.trim();
        explanationCache.set(cacheKey, enhancedExplanation);
        cacheTimestamps.set(cacheKey, Date.now());
    }
    catch (error) {
        console.warn('OpenAI error:', error.response?.data || error.message);
    }
}
