import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserNotifications, notificationSchema } from '@/lib/hubzz-api';
import { defaultUseMock } from '@/lib/mock-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.userId as string;
  const useMock = defaultUseMock(req);

  try {
    const payload = await getUserNotifications(userId, { useMock });
    res.status(200).json(notificationSchema.array().parse(payload));
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? (error as any).status : 500;
    res.status(status || 500).json({ error: 'Failed to fetch notifications' });
  }
}
