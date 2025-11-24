import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserTickets, HubzzApiError } from '../../../../lib/hubzz-api';
import { shouldUseMock } from '../../../../lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  const useMock = shouldUseMock(req);

  try {
    const tickets = await getUserTickets(String(userId), { useMock });
    res.status(200).json(tickets);
  } catch (error) {
    if (error instanceof HubzzApiError && error.status) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
}
