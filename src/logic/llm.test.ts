import axios from 'axios';
import { generateExplanation } from './llm'; 
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

afterAll(() => {
  jest.clearAllMocks();
});
jest.useFakeTimers();

describe('generateExplanation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate explanation when provider is present', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'Payment routed to Stripe because score was moderate.'
            }
          }
        ]
      }
    });

    const result = await generateExplanation(1000, 'user@example.com', 0.3, 'Stripe');

    expect(mockedAxios.post).toHaveBeenCalled();
    expect(result).toBe('Payment routed to Stripe because score was moderate.');
  });

  test('should generate explanation when payment is rejected', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'Payment was rejected due to high fraud risk.'
            }
          }
        ]
      }
    });

    const result = await generateExplanation(2000, 'user@spam.com', 0.9, null);

    expect(mockedAxios.post).toHaveBeenCalled();
    expect(result).toBe('Payment was rejected due to high fraud risk.');
  });

  test('should handle API failure gracefully', async () => {
    mockedAxios.post.mockRejectedValue(new Error('API is down'));

    const result = await generateExplanation(500, 'user@example.com', 0.2, 'Stripe');

    expect(result).toBe('Explanation generation failed.');
  });
});
