import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server';

const app = createServer();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Forward all requests to the Express app
  return app(req as any, res as any);
}
