import { createContext, useState, useEffect, useRef } from "react";
import { initSocket, getSocket } from "../socket/socketClient";
import apiClient from "../apiclient/apiclient";
import { toast } from "react-toastify";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const audioRef = useRef(null);
  const audioUnlockedRef = useRef(false);

  /* 🔊 INIT AUDIO (UNLOCK ON FIRST USER INTERACTION) */
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role === "kitchen") return;
    } catch {}

    audioRef.current = new Audio("/notification_sound.mp3");

    const unlockAudio = () => {
      if (!audioUnlockedRef.current && audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioUnlockedRef.current = true;
          })
          .catch(() => {});
      }
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, []);

  /* 📥 LOAD UNREAD NOTIFICATIONS */
  const loadUnread = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role === "kitchen") return;
      
      const res = await apiClient.get("/notifications?unread=true&limit=20");
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Failed to load unread notifications", err);
    }
  };
  // Remove duplicate socket listener useEffect

  // Move shownToastIds useRef to the component scope
  const shownToastIds = useRef(new Set());

  /* 🔔 SOCKET LISTENER */
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role === "kitchen") return;
    } catch {}

    // Ensure socket is initialized
    initSocket();
    let socket = getSocket();
    if (!socket) {
      const interval = setInterval(() => {
        socket = getSocket();
        if (socket) {
          clearInterval(interval);
          attachHandler(socket);
        }
      }, 300);
      return () => clearInterval(interval);
    }

    // Debug: log user role
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("[NotificationContext] User role:", user.role);
    } catch {}


    const handler = (data) => {
      console.log("[NotificationContext] Received notification:", data);
      setNotifications((prev) => [data, ...prev]);

      // 🔊 sound
      if (audioUnlockedRef.current && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // Prevent duplicate toasts for the same notification
      if (data && data._id && !shownToastIds.current.has(data._id)) {
        shownToastIds.current.add(data._id);
        toast(data.message, {
          position: "top-right",
          autoClose: 3500,
          pauseOnHover: true,
          className: "!bg-white !text-black !rounded-lg !shadow-lg !border-none",
          bodyClassName: "!text-base",
          icon: "🔔",
        });
      }

      // 🔄 Reload notifications for all features/pages
      loadUnread();
    };

    function attachHandler(sock) {
      sock.off("notification", handler);
      sock.on("notification", handler);
      loadUnread();
    }

    attachHandler(socket);
    return () => {
      if (socket) socket.off("notification", handler);
    };
  }, []);

  /* ✅ MARK ONE READ */
  const markRead = async (id) => {
    await apiClient.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  /* ✅ MARK ALL READ */
  const markAllRead = async () => {
    await apiClient.patch("/notifications/read-all");
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markRead,
        markAllRead,
        reload: loadUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
