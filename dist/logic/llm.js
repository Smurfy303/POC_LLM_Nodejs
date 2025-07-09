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
exports.generateExplanation = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function generateExplanation(amount, email, score, provider) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = provider
            ? `This payment of $${amount} from ${email} was routed to ${provider} due to a fraud risk score of ${score.toFixed(2)}. Write a short, professional explanation.`
            : `This payment of $${amount} from ${email} was rejected due to a fraud risk score of ${score.toFixed(2)}. Explain why.`;
        try {
            const res = yield axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100,
                temperature: 0.7
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            return res.data.choices[0].message.content.trim();
        }
        catch (error) {
            console.error('OpenAI error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            return 'Explanation generation failed.';
        }
    });
}
exports.generateExplanation = generateExplanation;
//# sourceMappingURL=llm.js.map