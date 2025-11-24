import type { HubzzStage } from './hubzz-api';

export function generateDeepLink(stage: HubzzStage, token?: string): string {
  const baseClientUrl = process.env.HUBZZ_CLIENT_URL || 'https://app.hubzz.com';
  const params = new URLSearchParams({
    zone: stage.zoneId,
    venue: stage.venueModuleId,
    x: stage.venueCoordinates.x.toString(),
    y: stage.venueCoordinates.y.toString(),
    z: stage.venueCoordinates.z.toString(),
  });

  if (token) {
    params.append('token', token);
  }

  return `${baseClientUrl}/join?${params.toString()}`;
}

export function openHubzzLink(deepLink: string) {
  if (typeof window === 'undefined') return;

  const isMobile = /iPhone|iPad|Android/i.test(window.navigator.userAgent);
  if (isMobile) {
    window.location.href = `hubzz://join?${deepLink}`;
    setTimeout(() => {
      window.location.href = deepLink;
    }, 1000);
  } else {
    window.open(deepLink, '_blank', 'noopener');
  }
}
