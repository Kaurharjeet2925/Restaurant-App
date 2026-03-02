import React, { useContext, useState } from "react";
import { Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";

const NotificationBell = () => {
  const { notifications = [], markRead, markAllRead } =
    useContext(NotificationContext);

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      {/* 🔔 BELL */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📋 DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50">
          {/* HEADER */}
          <div className="p-3 flex justify-between items-center border-b">
            <span className="font-semibold">Notifications</span>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm text-red-500 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* LIST */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-black text-sm">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div
                  key={n._id}
                  className={`p-3 flex gap-2 border-b cursor-pointer hover:bg-gray-50 ${
                    !n.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    if (!n.read) markRead(n._id);

                    // Optional redirect if orderId exists
                    if (n.data?.orderId) {
                      navigate(`/orders/${n.data.orderId}`);
                      setIsOpen(false);
                    }
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm text-black font-medium">{n.message}</p>

                    {/* 🔹 META INFO */}
                    <p className="text-xs text-black mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                      {n.activityType && ` • ${n.activityType}`}
                    </p>
                  </div>

                  {!n.read && (
                    <X
                      size={14}
                      className="mt-1 cursor-pointer text-gray-500 hover:text-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead(n._id);
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* VIEW ALL */}
          <div className="border-t p-2 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/activity");
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
