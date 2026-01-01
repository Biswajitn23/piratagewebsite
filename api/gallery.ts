import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { listGallery } from '../server/routes/gallery';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'GET') {
    return listGallery(req as any, res as any);
  }
  res.status(405).json({ error: 'Method not allowed' });
}
