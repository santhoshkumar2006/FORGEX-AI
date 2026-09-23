import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', router);

// Centralized Error Handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 SafeReplay Server running on port ${PORT}`);
    console.log(`🛡️  Privacy engine: ACTIVE (Pre-upload masking)`);
    console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'mock'}`);
    console.log(`=================================================`);
  });
}
