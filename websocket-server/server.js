const cors = require("cors");
const http = require("http");
const express = require("express");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://split-screen-fitness-display.vercel.app/"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

const connectedScreens = new Map();
const connectedControlPanels = new Set();

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    connectedScreens: Array.from(connectedScreens.keys()),
    controlPanels: connectedControlPanels.size
  });
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("register_screen", (data) => {
    const { screenId } = data;
    console.log(`📺 Screen registered: ${screenId}`);

    connectedScreens.set(screenId, socket);
    socket.screenId = screenId;
    socket.clientType = "screen";

    broadcastToControlPanels("screen_connected", { screenId });

    socket.emit("registration_success", {
      screenId,
      connectedScreens: Array.from(connectedScreens.keys())
    });
  });

  socket.on("register_control_panel", () => {
    console.log(`🎮 Control panel registered: ${socket.id}`);

    connectedControlPanels.add(socket);
    socket.clientType = "control_panel";

    socket.emit("connected_screens_update", {
      screens: Array.from(connectedScreens.keys())
    });
  });

  socket.on("sync_play", (data) => {
    const { targetScreens, timestamp } = data;
    console.log(`▶️  Sync play command for screens: ${targetScreens.join(", ")}`);

    targetScreens.forEach((screenId) => {
      const screenSocket = connectedScreens.get(screenId);
      if (screenSocket) {
        screenSocket.emit("play_command", { timestamp });
        console.log(`✅ Play command sent to ${screenId}`);
      } else {
        console.log(`❌ Screen ${screenId} not connected`);
      }
    });

    socket.emit("sync_command_ack", {
      action: "play",
      targetScreens,
      timestamp
    });
  });

  socket.on("sync_pause", (data) => {
    const { targetScreens, timestamp } = data;
    console.log(`⏸️  Sync pause command for screens: ${targetScreens.join(", ")}`);

    targetScreens.forEach((screenId) => {
      const screenSocket = connectedScreens.get(screenId);
      if (screenSocket) {
        screenSocket.emit("pause_command", { timestamp });
        console.log(`✅ Pause command sent to ${screenId}`);
      } else {
        console.log(`❌ Screen ${screenId} not connected`);
      }
    });

    socket.emit("sync_command_ack", {
      action: "pause",
      targetScreens,
      timestamp
    });
  });

  socket.on("screen_status", (data) => {
    const { screenId, status } = data;
    console.log(`Screen ${screenId} status: ${status}`);

    broadcastToControlPanels("screen_status_update", { screenId, status });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);

    if (socket.clientType === "screen" && socket.screenId) {
      console.log(`📺❌ Screen disconnected: ${socket.screenId}`);
      connectedScreens.delete(socket.screenId);

      broadcastToControlPanels("screen_disconnected", {
        screenId: socket.screenId
      });
    } else if (socket.clientType === "control_panel") {
      console.log(`🎮❌ Control panel disconnected: ${socket.id}`);
      connectedControlPanels.delete(socket);
    }
  });

  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

function broadcastToControlPanels(event, data) {
  connectedControlPanels.forEach((controlSocket) => {
    controlSocket.emit(event, data);
  });
}

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  io.close();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
