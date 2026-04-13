const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 60 * 1000;

const store = new Map<string, number>();

setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiresAt] of store) {
    if (now > expiresAt) store.delete(nonce);
  }
}, CLEANUP_INTERVAL_MS);

export function generateNonce(): string {
  const nonce = crypto.randomUUID();
  store.set(nonce, Date.now() + NONCE_TTL_MS);
  return nonce;
}

export function consumeNonce(nonce: string): boolean {
  const expiresAt = store.get(nonce);
  if (!expiresAt || Date.now() > expiresAt) return false;
  store.delete(nonce);
  return true;
}
