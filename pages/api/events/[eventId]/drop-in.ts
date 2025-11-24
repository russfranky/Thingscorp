import type { NextApiRequest, NextApiResponse } from 'next';
import { dropInSessionSchema, getDropInSession } from '@/lib/hubzz-api';
import { defaultUseMock } from '@/lib/mock-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const eventId = req.query.eventId as string;
  const useMock = defaultUseMock(req);

  try {
    const payload = await getDropInSession(eventId, { useMock });
    const parsed = dropInSessionSchema.parse(payload);
    res.status(200).json(parsed);
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? (error as any).status : 500;
    res.status(status || 500).json({ error: 'Failed to fetch drop-in session' });
  }
}
