/**
 * Simulated presence for the demo. A real app would get this from a realtime service.
 * Deterministic per profile and 15-minute window so it doesn't flicker between renders.
 */
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function isOnline(profileId: string, now: number = Date.now()): boolean {
  const slot = Math.floor(now / 9e5);
  return hash(`${profileId}:${slot}`) % 5 < 2;
}

export function lastSeenLabel(profileId: string, now: number = Date.now()): string {
  if (isOnline(profileId, now)) return "Online now";
  const mins = 5 + (hash(profileId) % 180);
  return mins < 60 ? `Last seen ${mins} min ago` : `Last seen ${Math.floor(mins / 60)} hr ago`;
}
