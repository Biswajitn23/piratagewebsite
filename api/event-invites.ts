import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { sendEventInvites } from '../server/routes/event-invites';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'POST') {
    return sendEventInvites(req as any, res as any);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
