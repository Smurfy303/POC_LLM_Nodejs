import axios from 'axios';
import { generateExplanation } from './llm'; 
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock environment variable
const mockEnvValue = 'test-api-key';
process.env.OPENAI_API_KEY = mockEnvValue;

afterAll(() => {
  jest.clearAllMocks();
});
jest.useFakeTimers();

describe('generateExplanation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful API responses', () => {
    test('should generate explanation when provider is present', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'Payment routed to Stripe because score was moderate.'
              }
            }
          ]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await generateExplanation(1000, 'user@example.com', 0.3, 'Stripe');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ 
            role: 'user', 
            content: 'This payment of $1000 from user@example.com was routed to Stripe due to a fraud risk score of 0.30. Write a short, professional explanation.'
          }],
          max_tokens: 100,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${mockEnvValue}`,
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toBe('Payment routed to Stripe because score was moderate.');
    });

    test('should generate explanation when payment is rejected (provider is null)', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'Payment was rejected due to high fraud risk.'
              }
            }
          ]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await generateExplanation(2000, 'user@spam.com', 0.9, null);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [{ 
            role: 'user', 
            content: 'This payment of $2000 from user@spam.com was rejected due to a fraud risk score of 0.90. Explain why.'
          }],
          max_tokens: 100,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${mockEnvValue}`,
            'Content-Type': 'application/json'
          }
        }
      );
      expect(result).toBe('Payment was rejected due to high fraud risk.');
    });

    test('should trim whitespace from API response', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: '  Payment explanation with spaces  \n'
              }
            }
          ]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await generateExplanation(500, 'user@test.com', 0.4, 'PayPal');

      expect(result).toBe('Payment explanation with spaces');
    });
  });

  describe('Edge cases and parameter validation', () => {
    test('should handle decimal amounts correctly', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'Test response' } }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await generateExplanation(99.99, 'user@test.com', 0.25, 'Stripe');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messages: [{ 
            role: 'user', 
            content: expect.stringContaining('$99.99')
          }]
        }),
        expect.any(Object)
      );
    });

    test('should handle high precision fraud scores', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'Test response' } }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await generateExplanation(1000, 'user@test.com', 0.123456789, 'Stripe');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messages: [{ 
            role: 'user', 
            content: expect.stringContaining('0.12') // Should be rounded to 2 decimal places
          }]
        }),
        expect.any(Object)
      );
    });

    test('should handle zero fraud score', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'Low risk payment' } }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await generateExplanation(100, 'safe@user.com', 0, 'Stripe');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messages: [{ 
            role: 'user', 
            content: expect.stringContaining('fraud risk score of 0.00')
          }]
        }),
        expect.any(Object)
      );
    });

    test('should handle maximum fraud score', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'High risk payment rejected' } }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await generateExplanation(5000, 'risky@user.com', 1.0, null);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messages: [{ 
            role: 'user', 
            content: expect.stringContaining('fraud risk score of 1.00')
          }]
        }),
        expect.any(Object)
      );
    });

    test('should handle different provider names', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'Payment processed via alternate provider' } }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await generateExplanation(750, 'user@test.com', 0.6, 'Alternative Payment Corp');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messages: [{ 
            role: 'user', 
            content: expect.stringContaining('routed to Alternative Payment Corp')
          }]
        }),
        expect.any(Object)
      );
    });
  });

  describe('Error handling', () => {
    test('should handle API failure gracefully', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API is down'));

      const result = await generateExplanation(500, 'user@example.com', 0.2, 'Stripe');

      expect(result).toBe('Explanation generation failed.');
    });

    test('should handle network timeout errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('timeout'));

      const result = await generateExplanation(1000, 'user@test.com', 0.5, null);

      expect(result).toBe('Explanation generation failed.');
    });

    test('should handle API error responses with error data', async () => {
      const apiError = {
        response: {
          data: {
            error: {
              message: 'Rate limit exceeded',
              type: 'rate_limit_error'
            }
          }
        }
      };
      mockedAxios.post.mockRejectedValue(apiError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await generateExplanation(800, 'user@test.com', 0.3, 'PayPal');

      expect(consoleSpy).toHaveBeenCalledWith('OpenAI error:', apiError.response.data);
      expect(result).toBe('Explanation generation failed.');

      consoleSpy.mockRestore();
    });

    test('should handle errors without response data', async () => {
      const simpleError = new Error('Connection refused');
      mockedAxios.post.mockRejectedValue(simpleError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await generateExplanation(200, 'user@test.com', 0.1, 'Stripe');

      expect(consoleSpy).toHaveBeenCalledWith('OpenAI error:', 'Connection refused');
      expect(result).toBe('Explanation generation failed.');

      consoleSpy.mockRestore();
    });

    test('should handle malformed API responses', async () => {
      const malformedResponse = {
        data: {
          choices: [] // Empty choices array
        }
      };
      mockedAxios.post.mockResolvedValue(malformedResponse);

      const result = await generateExplanation(300, 'user@test.com', 0.4, 'Stripe');

      // This should throw an error due to accessing choices[0] on empty array
      expect(result).toBe('Explanation generation failed.');
    });

    test('should handle responses missing message content', async () => {
      const incompleteResponse = {
        data: {
          choices: [
            {
              message: {} // Missing content property
            }
          ]
        }
      };
      mockedAxios.post.mockResolvedValue(incompleteResponse);

      const result = await generateExplanation(400, 'user@test.com', 0.35, null);

      expect(result).toBe('Explanation generation failed.');
    });
  });

  describe('API call configuration', () => {
    test('should use correct OpenAI model and parameters', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'Test response' } }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await generateExplanation(1000, 'user@test.com', 0.5, 'Stripe');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: expect.any(Array),
          max_tokens: 100,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${mockEnvValue}`,
            'Content-Type': 'application/json'
          }
        }
      );
    });

    test('should include proper authorization headers', async () => {
      const mockResponse = {
        data: {
          choices: [{ message: { content: 'Test response' } }]
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await generateExplanation(500, 'user@test.com', 0.2, null);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        {
          headers: {
            Authorization: `Bearer ${mockEnvValue}`,
            'Content-Type': 'application/json'
          }
        }
      );
    });
  });
});
