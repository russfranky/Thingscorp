export function parseUseMock(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  return !(value === 'false' || value === '0');
}

export function defaultUseMock(): boolean {
  const envPreference =
    parseUseMock(process.env.HUBZZ_USE_MOCK) ?? parseUseMock(process.env.NEXT_PUBLIC_HUBZZ_USE_MOCK);
  return envPreference ?? true;
}
