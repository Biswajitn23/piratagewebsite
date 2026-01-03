import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { sendEventNotifications, getNotificationStats } from '../../server/routes/notifications';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Dummy next function for Express middleware compatibility
  const next = () => {};
  
  // Route to different handlers based on the path
  const path = req.url || '';
  
  if (path.includes('/send') && req.method === 'POST') {
    return await sendEventNotifications(req as any, res as any, next);
  }
  
  if (path.includes('/stats') && req.method === 'GET') {
    return await getNotificationStats(req as any, res as any, next);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
