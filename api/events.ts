import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { listEvents, createEvent } from '../server/routes/events';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'GET') {
    return listEvents(req as any, res as any);
  }
  if (req.method === 'POST') {
    return createEvent(req as any, res as any);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
