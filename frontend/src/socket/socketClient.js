import { io } from "socket.io-client";
import { toast } from "react-toastify";

/* ================= GET AUTH TOKEN ================= */
const getToken = () => {
  try {
    return (
      localStorage.getItem("token") ||
      JSON.parse(localStorage.getItem("auth") || "{}")?.token ||
      JSON.parse(localStorage.getItem("user") || "{}")?.token ||
      null
    );
  } catch {
    return null;
  }
};

let socket = null;

/* ================= INIT SOCKET ================= */
export const initSocket = () => {
  const token = getToken();
  if (!token) return null;

  if (!socket) {
    socket = io(
      process.env.REACT_APP_IMAGE_URL || "http://localhost:5000",
      {
        path: "/socket.io",          // 🔥 THIS FIXES /ws ISSUE
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      }
    );

    socket.on("connect", () => {
      console.log("⚡ Socket connected:", socket.id);
      // Join role room for notifications
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user && user.role) {
          socket.emit("join-room", { room: `role:${user.role}` });
          console.log(`[socketClient] Joined room: role:${user.role}`);
        }
      } catch (err) {
        console.warn("[socketClient] Failed to join role room", err);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);

      if (
        err.message.toLowerCase().includes("token") ||
        err.message.toLowerCase().includes("unauthorized")
      ) {
        localStorage.clear();
        toast.error("Session expired. Please login again.");
        window.location.href = "/";
      }
    });
  }

  return socket;
};

/* ================= HELPERS ================= */
export const getSocket = () => socket;

export const reconnectSocketWithToken = () => {
  const token = getToken();
  if (!token || !socket) return;

  socket.auth = { token };
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
