import type { NextApiRequest } from 'next';
import { defaultUseMock, parseUseMock } from './mock-config';

export function shouldUseMock(req: NextApiRequest): boolean {
  const value = req.query.mock;
  if (typeof value === 'string') {
    return value !== 'false' && value !== '0';
  }
  if (Array.isArray(value)) {
    return value[0] !== 'false' && value[0] !== '0';
  }
  const envPreference = parseUseMock(process.env.HUBZZ_USE_MOCK);
  return envPreference ?? defaultUseMock();
}
