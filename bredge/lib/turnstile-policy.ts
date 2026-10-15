/** Production CAPTCHA policy, kept testable without network or Worker credentials. */
export function requiresTurnstileSecret(hostname: string, secret: string | undefined): boolean {
  const local = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  return !local && (!secret || secret.trim().length === 0);
}

export function verifiedTurnstileForHost(response: unknown, hostname: string): boolean {
  if (!response || typeof response !== "object") return false;
  const value = response as { success?: unknown; hostname?: unknown };
  return value.success === true && typeof value.hostname === "string" &&
    value.hostname.toLowerCase() === hostname.toLowerCase();
}
