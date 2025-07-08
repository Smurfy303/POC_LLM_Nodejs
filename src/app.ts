import express from 'express';
import router from './route';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

dotenv.config();
const app = express();

// Security middleware
app.use(helmet());

// Compression middleware for better performance
app.use(compression());

// CORS with specific configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  maxAge: 86400 // Cache preflight for 24 hours
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// JSON parsing with size limit
app.use(express.json({ limit: '10mb' }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
}

app.use('/api', router);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔒 Security headers enabled`);
  console.log(`⚡ Compression enabled`);
  console.log(`🛡️  Rate limiting enabled (100 req/15min)`);
});
