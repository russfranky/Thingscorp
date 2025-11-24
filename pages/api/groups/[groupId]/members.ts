import type { NextApiRequest, NextApiResponse } from 'next';
import { getGroupMembers, HubzzApiError } from '@/lib/hubzz-api';
import { shouldUseMock } from '@/lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groupId } = req.query;

  if (typeof groupId !== 'string') {
    return res.status(400).json({ error: 'Missing groupId' });
  }

  const useMock = shouldUseMock(req);

  try {
    const members = await getGroupMembers(groupId, { useMock });
    return res.status(200).json(members);
  } catch (error) {
    const status = error instanceof HubzzApiError && error.status ? error.status : 500;
    const message = error instanceof HubzzApiError ? error.message : 'Failed to fetch group members';
    return res.status(status).json({ error: message });
  }
}
