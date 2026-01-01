import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { sendEventNotifications, getNotificationStats } from '../../server/routes/notifications';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Route to different handlers based on the path
  const path = req.url || '';
  
  if (path.includes('/send') && req.method === 'POST') {
    return sendEventNotifications(req as any, res as any, () => {});
  }
  
  if (path.includes('/stats') && req.method === 'GET') {
    return getNotificationStats(req as any, res as any, () => {});
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
