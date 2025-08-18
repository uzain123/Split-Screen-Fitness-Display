import { useEffect, useState } from "react";
import io from "socket.io-client";

export const useWebSocket = (screenId = null) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedScreens, setConnectedScreens] = useState([]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001";

    console.log("🔌 Connecting to WebSocket:", wsUrl);

    const socketInstance = io(wsUrl, {
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"]
    });

    if (typeof window !== "undefined") {
      window.socket = socketInstance;
      window.socketConnected = false;
    }

    socketInstance.on("connect", () => {
      console.log("✅ Connected to WebSocket server:", socketInstance.id);
      setIsConnected(true);
      setSocket(socketInstance);

      if (typeof window !== "undefined") {
        window.socketConnected = true;
      }

      if (screenId && screenId !== "control_panel") {
        console.log("📺 Registering screen:", screenId);
        socketInstance.emit("register_screen", { screenId });
      } else {
        console.log("🎮 Registering control panel");
        socketInstance.emit("register_control_panel");
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket server");
      setIsConnected(false);

      if (typeof window !== "undefined") {
        window.socketConnected = false;
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🚫 WebSocket connection error:", error);
      setIsConnected(false);

      if (typeof window !== "undefined") {
        window.socketConnected = false;
      }
    });

    socketInstance.on("connected_screens_update", (data) => {
      console.log("📊 Connected screens updated:", data.screens);
      setConnectedScreens(data.screens || []);
    });

    socketInstance.on("screen_connected", (data) => {
      console.log("📱 Screen connected:", data.screenId);
      setConnectedScreens((prev) => [...prev, data.screenId]);
    });

    socketInstance.on("screen_disconnected", (data) => {
      console.log("📱 Screen disconnected:", data.screenId);
      setConnectedScreens((prev) => prev.filter((id) => id !== data.screenId));
    });

    if (screenId && screenId !== "control_panel") {
      socketInstance.on("play_command", (data) => {
        console.log("🎬 Received play command:", data);
        window.dispatchEvent(
          new CustomEvent("websocket-sync-play", {
            detail: { targetScreens: [screenId], timestamp: data.timestamp }
          })
        );
      });

      socketInstance.on("pause_command", (data) => {
        console.log("⏸️ Received pause command:", data);
        window.dispatchEvent(
          new CustomEvent("websocket-sync-pause", {
            detail: { targetScreens: [screenId], timestamp: data.timestamp }
          })
        );
      });
    }

    socketInstance.on("sync_command_ack", (data) => {
      console.log("✅ Sync command acknowledged:", data);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
      if (typeof window !== "undefined") {
        window.socket = null;
        window.socketConnected = false;
      }
    };
  }, [screenId]);

  const emit = (event, data) => {
    if (socket && isConnected) {
      console.log("📡 Emitting:", event, data);
      socket.emit(event, data);
    } else {
      console.warn("⚠️ Cannot emit - socket not connected:", event, data);
    }
  };

  const sendSyncPlay = (targetScreens, timestamp) => {
    emit("sync_play", { targetScreens, timestamp });
  };

  const sendSyncPause = (targetScreens, timestamp) => {
    emit("sync_pause", { targetScreens, timestamp });
  };

  return {
    socket,
    isConnected,
    connectedScreens,
    emit
  };
};

if (typeof window !== "undefined") {
  window.checkWebSocketStatus = () => {
    console.log("🔍 WebSocket Status Check:");
    console.log("Socket ID:", window.socket?.id);
    console.log("Socket object:", window.socket);
    console.log("Connected:", window.socketConnected);
    console.log("Socket connected:", window.socket?.connected);
  };

  window.testSyncPlay = (screens = ["1"]) => {
    if (window.socket && window.socketConnected) {
      console.log("🎬 Testing sync play for screens:", screens);
      window.socket.emit("sync_play", {
        targetScreens: screens,
        timestamp: Date.now()
      });
    } else {
      console.error("❌ Socket not connected. Cannot test sync.");
    }
  };

  window.testSyncPause = (screens = ["1"]) => {
    if (window.socket && window.socketConnected) {
      console.log("⏸️ Testing sync pause for screens:", screens);
      window.socket.emit("sync_pause", {
        targetScreens: screens,
        timestamp: Date.now()
      });
    } else {
      console.error("❌ Socket not connected. Cannot test sync.");
    }
  };
}
