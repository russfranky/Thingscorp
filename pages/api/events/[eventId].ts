import type { NextApiRequest, NextApiResponse } from 'next';
import { getEvent, HubzzApiError } from '@/lib/hubzz-api';
import { shouldUseMock } from '@/lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId } = req.query;

  if (typeof eventId !== 'string') {
    return res.status(400).json({ error: 'Missing eventId' });
  }

  const useMock = shouldUseMock(req);

  try {
    const event = await getEvent(eventId, { useMock });
    return res.status(200).json(event);
  } catch (error) {
    const status = error instanceof HubzzApiError && error.status ? error.status : 500;
    const message = error instanceof HubzzApiError ? error.message : 'Failed to fetch event';
    return res.status(status).json({ error: message });
  }
}
