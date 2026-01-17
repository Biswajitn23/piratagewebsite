
import "dotenv/config";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server/index.js';

const app = createServer();

// For debugging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  return new Promise<void>((resolve) => {
    // Handle the request with Express
    app(req as any, res as any);
    
    // Ensure the promise resolves
    const onFinish = () => {
      res.removeListener('finish', onFinish);
      res.removeListener('close', onFinish);
      resolve();
    };
    
    res.on('finish', onFinish);
    res.on('close', onFinish);
    
    // Timeout after 30 seconds
    setTimeout(() => resolve(), 30000);
  });
}
