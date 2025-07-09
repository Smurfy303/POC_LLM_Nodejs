"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const llm_1 = require("./llm");
jest.mock('axios');
const mockedAxios = axios_1.default;
afterAll(() => {
    jest.clearAllMocks();
});
jest.useFakeTimers();
describe('generateExplanation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('should generate explanation when provider is present', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield (0, llm_1.generateExplanation)(1000, 'user@example.com', 0.3, 'Stripe');
        expect(mockedAxios.post).toHaveBeenCalled();
        expect(result).toBe('Payment routed to Stripe because score was moderate.');
    }));
    test('should generate explanation when payment is rejected', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield (0, llm_1.generateExplanation)(2000, 'user@spam.com', 0.9, null);
        expect(mockedAxios.post).toHaveBeenCalled();
        expect(result).toBe('Payment was rejected due to high fraud risk.');
    }));
    test('should handle API failure gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
        mockedAxios.post.mockRejectedValue(new Error('API is down'));
        const result = yield (0, llm_1.generateExplanation)(500, 'user@example.com', 0.2, 'Stripe');
        expect(result).toBe('Explanation generation failed.');
    }));
});
//# sourceMappingURL=llm.test.js.map