import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server';

const app = createServer();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Forward all requests to the Express app
  return new Promise<void>((resolve) => {
    app(req as any, res as any);
    res.on('finish', resolve);
    // Also resolve if no response after timeout
    setTimeout(resolve, 30000);
  });
}
