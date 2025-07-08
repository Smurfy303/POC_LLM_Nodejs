import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();


export async function generateExplanation(
  amount: number,
  email: string,
  score: number,
  provider: string | null
): Promise<string> {
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
        }
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('OpenAI error:', error.response?.data || error.message);
    return 'Explanation generation failed.';
  }
}
