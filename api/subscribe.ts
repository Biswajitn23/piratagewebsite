import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { subscribeEmail, unsubscribeEmail } from '../server/routes/subscribe';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'POST') {
    return subscribeEmail(req as any, res as any);
  }
  if (req.method === 'GET') {
    return unsubscribeEmail(req as any, res as any);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
