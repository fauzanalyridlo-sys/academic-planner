const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;

type SessionValidityInput = {
  expires: Date;
  lastActivityAt: Date;
  now: number;
};

export function isSessionValid({
  expires,
  lastActivityAt,
  now,
}: SessionValidityInput): boolean {
  const isExpired = expires.getTime() <= now;
  const isIdle = now - lastActivityAt.getTime() >= IDLE_TIMEOUT_MS;

  return !isExpired && !isIdle;
}