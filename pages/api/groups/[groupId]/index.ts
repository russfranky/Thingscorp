import type { NextApiRequest, NextApiResponse } from 'next';
import { getGroupProfile } from '@/lib/hubzz-api';
import { shouldUseMock } from '@/lib/api-helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const groupId = req.query.groupId as string;
    const useMock = shouldUseMock(req);
    const profile = await getGroupProfile(groupId, { useMock });
    res.status(200).json(profile);
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error ? Number((error as any).status) : 500;
    res.status(status || 500).json({ message: 'Unable to load group profile' });
  }
}
