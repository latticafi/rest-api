import { describe, expect, test } from "bun:test";

import { getAllPrices, getMidPrice, updatePrice } from "@/pricefeed/store";

describe("pricefeed store", () => {
  test("updatePrice stores bid/ask/mid", () => {
    updatePrice("0x01", 0.55, 0.57);
    const data = getMidPrice("0x01");
    expect(data).not.toBeNull();
    expect(data!.bid).toBe(0.55);
    expect(data!.ask).toBe(0.57);
    expect(data!.mid).toBe(0.56);
  });

  test("getMidPrice returns null for unknown conditionId", () => {
    expect(getMidPrice("0xunknown")).toBeNull();
  });

  test("updatePrice rejects bid <= 0", () => {
    updatePrice("0xbad1", 0, 0.5);
    expect(getMidPrice("0xbad1")).toBeNull();
  });

  test("updatePrice rejects ask <= bid", () => {
    updatePrice("0xbad2", 0.6, 0.5);
    expect(getMidPrice("0xbad2")).toBeNull();
  });

  test("updatePrice rejects ask == bid", () => {
    updatePrice("0xbad3", 0.5, 0.5);
    expect(getMidPrice("0xbad3")).toBeNull();
  });

  test("updatePrice overwrites previous value", () => {
    updatePrice("0x02", 0.4, 0.42);
    updatePrice("0x02", 0.5, 0.52);
    const data = getMidPrice("0x02");
    expect(data!.bid).toBe(0.5);
  });

  test("getAllPrices returns the full map", () => {
    updatePrice("0x03", 0.3, 0.32);
    const all = getAllPrices();
    expect(all.has("0x03")).toBe(true);
  });

  test("updatedAt is set to recent timestamp", () => {
    const before = Date.now();
    updatePrice("0x04", 0.6, 0.62);
    const data = getMidPrice("0x04");
    expect(data!.updatedAt).toBeGreaterThanOrEqual(before);
    expect(data!.updatedAt).toBeLessThanOrEqual(Date.now());
  });
});
