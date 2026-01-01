import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { syncEventsToCalendar } from '../server/routes/sync-calendar';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'POST') {
    return syncEventsToCalendar(req as any, res as any);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
