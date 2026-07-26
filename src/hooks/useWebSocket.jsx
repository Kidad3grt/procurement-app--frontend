// src/hooks/useWebSocket.js
// ─────────────────────────────────────────────────────────────────────────────
// React hook that owns the WebSocket lifecycle for the current user.
//
// Cookie auth: the browser sends the access_token HttpOnly cookie
// automatically in the WS upgrade handshake — no token in the URL.
//
// Multi-tab isolation: each tab logs in independently so each has its own
// session cookie. Connecting to ws://localhost:8000/ws/procurement/notifications/
// from Tab 1 (Procurement Officer) and Tab 2 (Managerial Officer) results in
// two separate WebSocket connections authenticated as two different users,
// joining two different channel groups — exactly what we need for real-time
// notification testing between roles.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from "react";
import ProcurementSocket from "../api/websocket";

/**
 * @param {string|null}  userId         – Current user's UUID (falsy = skip connect)
 * @param {Function}     onNotification – Called with parsed WS event objects
 * @returns {{ markRead: (id: string) => void }}
 */
function useWebSocket(userId, onNotification) {
  const socketRef = useRef(null);

  // Keep the callback ref stable so changing onNotification never
  // recreates the socket
  const cbRef = useRef(onNotification);
  useEffect(() => { cbRef.current = onNotification; }, [onNotification]);

  useEffect(() => {
    if (!userId) return;

    const socket = new ProcurementSocket(
      (data) => {
        if (data.event === "new_notification" && cbRef.current) {
          cbRef.current(data);
        }
      },
      () => console.log("[WS] connected"),
      () => console.log("[WS] disconnected"),
    );

    // No token argument — browser sends cookie in upgrade headers
    socket.connect(userId);
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const markRead = useCallback((notificationId) => {
    socketRef.current?.markRead(notificationId);
  }, []);

  return { markRead };
}

export default useWebSocket;