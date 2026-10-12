// src/api/websocket.js
// ─────────────────────────────────────────────────────────────────────────────
// WebSocket client for the procurement notification channel.
//
// Cookie-based auth — how it works:
//   The browser automatically sends ALL cookies, including HttpOnly ones,
//   in the HTTP upgrade request that initiates the WebSocket handshake.
//   The Django Channels consumer reads the 'access_token' cookie from
//   scope["headers"] — exactly as a normal HTTP request would deliver it.
//
//   This means:
//     • No ?token= query param in the WebSocket URL (was the old approach)
//     • JS never handles the token at all
//     • Multi-tab testing still works: each tab logs in separately and
//       gets its own session cookie, so Tab 1 (Procurement Officer) and
//       Tab 2 (Managerial Officer) connect as different users automatically
//
// Reconnect:
//   If the WS closes (network drop, server restart), we reconnect after
//   4 seconds. By that time the silent cookie refresh may have already
//   issued a new access_token cookie, so the new connection is fresh.
// ─────────────────────────────────────────────────────────────────────────────

const WS_BASE = "ws://16.192.77.53:8000";
//`${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

class ProcurementSocket {
  constructor(onMessage, onConnected, onDisconnected) {
    this.ws              = null;
    this.reconnectTimer  = null;
    this.userId          = null;
    this.shouldReconnect = true;
    this.onMessage       = onMessage;
    this.onConnected     = onConnected;
    this.onDisconnected  = onDisconnected;
  }

  connect(userId) {
    if (!userId) return;
    this.userId = userId;

    // No token in URL — the browser sends the access_token cookie
    // automatically in the upgrade handshake headers.
    const url = `${WS_BASE}/ws/procurement/notifications/`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log(`[WS] Connected – user ${userId}`);
      if (this.onConnected) this.onConnected();
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (this.onMessage) this.onMessage(data);
      } catch {
        // malformed frame — ignore
      }
    };

    this.ws.onclose = (event) => {
      console.log(`[WS] Disconnected – code ${event.code}`);
      if (this.onDisconnected) this.onDisconnected();

      if (this.shouldReconnect) {
        // Delay reconnect to allow silent cookie refresh to complete first.
        // When we reconnect, the browser will automatically send the
        // (possibly refreshed) access_token cookie again.
        this.reconnectTimer = setTimeout(
          () => this.connect(this.userId),
          4000
        );
      }
    };

    this.ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      this.ws?.close();
    };
  }

  send(event, payload = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, ...payload }));
    }
  }

  markRead(notificationId) {
    this.send("mark_read", { notification_id: notificationId });
  }

  ping() {
    this.send("ping");
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

export default ProcurementSocket;



// // src/api/websocket.js
// // ─────────────────────────────────────────────────────────────
// // WebSocket client (COOKIE-AUTH VERSION)
// //
// // IMPORTANT CHANGE:
// // - NO token in URL
// // - NO sessionStorage
// // - Auth is handled by Django via HTTP-only cookies
// // - Browser automatically sends cookies during handshake
// // ─────────────────────────────────────────────────────────────

// const WS_BASE = "ws://127.0.0.1:8000";

// class ProcurementSocket {
//   constructor(onMessage, onConnected, onDisconnected) {
//     this.ws = null;
//     this.reconnectTimer = null;
//     this.userId = null;
//     this.shouldReconnect = true;

//     this.onMessage = onMessage;
//     this.onConnected = onConnected;
//     this.onDisconnected = onDisconnected;
//   }

//   connect(userId) {
//     if (!userId) return;

//     this.userId = userId;

//     // 🔥 NO TOKEN ANYMORE
//     // Browser automatically sends cookies with WebSocket handshake
//     const url = `${WS_BASE}/ws/procurement/notifications/`;

//     this.ws = new WebSocket(url);

//     this.ws.onopen = () => {
//       console.log(`[WS] Connected – user ${userId}`);
//       if (this.onConnected) this.onConnected();
//     };

//     this.ws.onmessage = (e) => {
//       try {
//         const data = JSON.parse(e.data);
//         if (this.onMessage) this.onMessage(data);
//       } catch (err) {
//         console.warn("[WS] Invalid message format", err);
//       }
//     };

//     this.ws.onclose = (event) => {
//       console.log(`[WS] Disconnected – code ${event.code}`);
//       if (this.onDisconnected) this.onDisconnected();

//       // 🔥 Auto reconnect
//       if (this.shouldReconnect) {
//         this.reconnectTimer = setTimeout(() => {
//           this.connect(this.userId);
//         }, 4000);
//       }
//     };

//     this.ws.onerror = (err) => {
//       console.error("[WS] Error:", err);
//       this.ws?.close();
//     };
//   }

//   send(event, payload = {}) {
//     if (this.ws?.readyState === WebSocket.OPEN) {
//       this.ws.send(JSON.stringify({ event, ...payload }));
//     }
//   }

//   markRead(notificationId) {
//     this.send("mark_read", { notification_id: notificationId });
//   }

//   ping() {
//     this.send("ping");
//   }

//   disconnect() {
//     this.shouldReconnect = false;
//     if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
//     this.ws?.close();
//     this.ws = null;
//   }
// }

// export default ProcurementSocket;