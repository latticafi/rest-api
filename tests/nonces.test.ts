import { describe, expect, test } from "bun:test";

import { consumeNonce, generateNonce } from "@/lib/nonces";

describe("Nonce store", () => {
  test("generates alphanumeric nonces (SIWE requirement)", () => {
    const nonce = generateNonce();
    expect(nonce).toMatch(/^[a-f0-9]{32}$/);
  });

  test("generates unique nonces", () => {
    const nonces = new Set(Array.from({ length: 100 }, () => generateNonce()));
    expect(nonces.size).toBe(100);
  });

  test("consumes a valid nonce", () => {
    const nonce = generateNonce();
    expect(consumeNonce(nonce)).toBe(true);
  });

  test("rejects already consumed nonce", () => {
    const nonce = generateNonce();
    consumeNonce(nonce);
    expect(consumeNonce(nonce)).toBe(false);
  });

  test("rejects unknown nonce", () => {
    expect(consumeNonce("does-not-exist")).toBe(false);
  });
});
