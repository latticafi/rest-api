import { dispatch } from "./dispatch";

const CLOB_WSS_URL =
  process.env.CLOB_WSS_URL ||
  "wss://ws-subscriptions-clob.polymarket.com/ws/market";
const HEARTBEAT_MS = 10_000;
const RECONNECT_MS = 5_000;

let ws: WebSocket | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let onReconnect: (() => Promise<void>) | null = null;

export function setReconnectHandler(handler: () => Promise<void>) {
  onReconnect = handler;
}

export function connect(assetIds: string[]) {
  if (assetIds.length === 0) {
    console.log("[pricefeed] No active markets, retrying in 5s");
    scheduleReconnect();
    return;
  }

  console.log(
    `[pricefeed] Connecting to ${CLOB_WSS_URL} with ${assetIds.length} assets`,
  );
  ws = new WebSocket(CLOB_WSS_URL);

  ws.addEventListener("open", () => {
    console.log("[pricefeed] Connected");
    ws!.send(JSON.stringify({ assets_ids: assetIds, type: "market" }));
    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) ws.send("PING");
    }, HEARTBEAT_MS);
  });

  ws.addEventListener("message", (event) => {
    dispatch(String(event.data));
  });

  ws.addEventListener("close", () => {
    console.log("[pricefeed] Disconnected");
    cleanup();
    scheduleReconnect();
  });

  ws.addEventListener("error", (event) => {
    console.error("[pricefeed] Error:", event);
    cleanup();
    scheduleReconnect();
  });
}

export function sendSubscribe(assetIds: string[]) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ assets_ids: assetIds, type: "market" }));
  }
}

export function close() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    cleanup();
  }
}

function cleanup() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  ws = null;
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (onReconnect) await onReconnect();
  }, RECONNECT_MS);
}
