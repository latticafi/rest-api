const NONCE_TTL_MS = 5 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

const store = new Map<string, number>();

setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiresAt] of store) {
    if (now > expiresAt) store.delete(nonce);
  }
}, CLEANUP_INTERVAL_MS);

export function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  store.set(nonce, Date.now() + NONCE_TTL_MS);
  return nonce;
}

export function consumeNonce(nonce: string): boolean {
  const expiresAt = store.get(nonce);
  if (!expiresAt || Date.now() > expiresAt) return false;
  store.delete(nonce);
  return true;
}
