import type { NextApiRequest, NextApiResponse } from 'next';
import { getStub, HubzzApiError } from '@/lib/hubzz-api';
import { shouldUseMock } from '@/lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { stubId } = req.query;

  if (typeof stubId !== 'string') {
    return res.status(400).json({ error: 'Missing stubId' });
  }

  const useMock = shouldUseMock(req);

  try {
    const stub = await getStub(stubId, { useMock });
    return res.status(200).json(stub);
  } catch (error) {
    const status = error instanceof HubzzApiError && error.status ? error.status : 500;
    const message = error instanceof HubzzApiError ? error.message : 'Failed to fetch stub';
    return res.status(status).json({ error: message });
  }
}
