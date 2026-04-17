import { beforeEach, describe, expect, test } from "bun:test";

import { clearAssets, dispatch, registerAsset } from "@/pricefeed/dispatch";
import { clearPrices, getMidPrice } from "@/pricefeed/store";

const ASSET_ID =
  "109681959945973300464568698402968596289258214226684818748321941747028805721376";
const CONDITION_ID =
  "0xcafe000000000000000000000000000000000000000000000000000000000000";

beforeEach(() => {
  clearAssets();
  clearPrices();
  registerAsset(ASSET_ID, CONDITION_ID);
});

describe("dispatch book event", () => {
  test("updates price from full orderbook", () => {
    dispatch(
      JSON.stringify({
        event_type: "book",
        asset_id: ASSET_ID,
        bids: [
          { price: "0.55", size: "100" },
          { price: "0.54", size: "200" },
        ],
        asks: [
          { price: "0.57", size: "150" },
          { price: "0.58", size: "100" },
        ],
      }),
    );

    const data = getMidPrice(CONDITION_ID);
    expect(data).not.toBeNull();
    expect(data!.bid).toBe(0.55);
    expect(data!.ask).toBe(0.57);
    expect(data!.mid).toBeCloseTo(0.56);
  });

  test("ignores book for unregistered asset", () => {
    dispatch(
      JSON.stringify({
        event_type: "book",
        asset_id: "unknown_asset",
        bids: [{ price: "0.55", size: "100" }],
        asks: [{ price: "0.57", size: "150" }],
      }),
    );

    expect(getMidPrice("0xunknown")).toBeNull();
  });

  test("ignores book with empty bids", () => {
    dispatch(
      JSON.stringify({
        event_type: "book",
        asset_id: ASSET_ID,
        bids: [],
        asks: [{ price: "0.57", size: "150" }],
      }),
    );

    expect(getMidPrice(CONDITION_ID)).toBeNull();
  });
});

describe("dispatch price_change event", () => {
  test("updates price from best_bid/best_ask in changes", () => {
    dispatch(
      JSON.stringify({
        event_type: "price_change",
        price_changes: [
          {
            asset_id: ASSET_ID,
            best_bid: "0.60",
            best_ask: "0.62",
            price: "0.61",
            size: "50",
            side: "BUY",
          },
        ],
      }),
    );

    const data = getMidPrice(CONDITION_ID);
    expect(data).not.toBeNull();
    expect(data!.bid).toBe(0.6);
    expect(data!.ask).toBe(0.62);
  });

  test("handles multiple changes in one message", () => {
    const otherAsset = "999999";
    const otherCondition =
      "0xdead000000000000000000000000000000000000000000000000000000000000";
    registerAsset(otherAsset, otherCondition);

    dispatch(
      JSON.stringify({
        event_type: "price_change",
        price_changes: [
          { asset_id: ASSET_ID, best_bid: "0.50", best_ask: "0.52" },
          { asset_id: otherAsset, best_bid: "0.70", best_ask: "0.72" },
        ],
      }),
    );

    expect(getMidPrice(CONDITION_ID)!.mid).toBeCloseTo(0.51);
    expect(getMidPrice(otherCondition)!.mid).toBeCloseTo(0.71);
  });

  test("skips changes without best_bid or best_ask", () => {
    dispatch(
      JSON.stringify({
        event_type: "price_change",
        price_changes: [{ asset_id: ASSET_ID, price: "0.60", size: "10" }],
      }),
    );

    expect(getMidPrice(CONDITION_ID)).toBeNull();
  });
});

describe("dispatch best_bid_ask event", () => {
  test("updates price", () => {
    dispatch(
      JSON.stringify({
        event_type: "best_bid_ask",
        asset_id: ASSET_ID,
        best_bid: "0.45",
        best_ask: "0.47",
      }),
    );

    const data = getMidPrice(CONDITION_ID);
    expect(data).not.toBeNull();
    expect(data!.mid).toBeCloseTo(0.46);
  });
});

describe("dispatch edge cases", () => {
  test("ignores PONG messages", () => {
    dispatch("PONG");
  });

  test("ignores invalid JSON", () => {
    dispatch("not json{{{");
  });

  test("ignores unknown event types", () => {
    dispatch(
      JSON.stringify({ event_type: "tick_size_change", asset_id: ASSET_ID }),
    );
  });
});
