import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Simple in-memory cache for LLM responses
const explanationCache = new Map<string, string>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const cacheTimestamps = new Map<string, number>();

// Clear expired cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of cacheTimestamps.entries()) {
    if (now - timestamp > CACHE_TTL) {
      explanationCache.delete(key);
      cacheTimestamps.delete(key);
    }
  }
}, 10 * 60 * 1000); // Clean every 10 minutes

function generateCacheKey(amount: number, email: string, score: number, provider: string | null): string {
  return `${amount}-${email.split('@')[1]}-${score.toFixed(1)}-${provider}`;
}

function getDefaultExplanation(amount: number, score: number, provider: string | null): string {
  if (provider) {
    return `Payment of $${amount} processed via ${provider} (risk score: ${score.toFixed(2)})`;
  } else {
    return `Payment of $${amount} rejected due to high fraud risk (score: ${score.toFixed(2)})`;
  }
}

export async function generateExplanation(
  amount: number,
  email: string,
  score: number,
  provider: string | null
): Promise<string> {
  const cacheKey = generateCacheKey(amount, email, score, provider);
  
  // Check cache first
  if (explanationCache.has(cacheKey)) {
    return explanationCache.get(cacheKey)!;
  }

  // Return default explanation immediately
  const defaultExplanation = getDefaultExplanation(amount, score, provider);
  
  // Generate enhanced explanation asynchronously (don't await)
  generateEnhancedExplanation(amount, email, score, provider, cacheKey)
    .catch(error => {
      console.warn('Background LLM call failed:', error.message);
    });

  return defaultExplanation;
}

async function generateEnhancedExplanation(
  amount: number,
  email: string,
  score: number,
  provider: string | null,
  cacheKey: string
): Promise<void> {
  const prompt = provider
    ? `This payment of $${amount} from ${email} was routed to ${provider} due to a fraud risk score of ${score.toFixed(2)}. Write a short, professional explanation.`
    : `This payment of $${amount} from ${email} was rejected due to a fraud risk score of ${score.toFixed(2)}. Explain why.`;

  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      }
    );

    const enhancedExplanation = res.data.choices[0].message.content.trim();
    
    // Cache the enhanced explanation
    explanationCache.set(cacheKey, enhancedExplanation);
    cacheTimestamps.set(cacheKey, Date.now());
    
  } catch (error: any) {
    console.warn('OpenAI error:', error.response?.data || error.message);
    // Don't update cache on error - keep using default explanation
  }
}
