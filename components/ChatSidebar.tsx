"use client";

import React, { useEffect, useState } from "react";
import { getChatContact } from "@/app/actions/user.action";
import { ChatUser } from "@/app/types/chat";
import { getSocket, subscribeMessages, isUserOnline } from "@/lib/socket";

type ChatSidebarProps = {
  selectedUser: ChatUser | null;
  setSelectedUser: (user: ChatUser) => void;
  currentUserId: string;
};

const ChatSidebar = ({ selectedUser, setSelectedUser, currentUserId }: ChatSidebarProps) => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("unreadCounts");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Persist unreadCounts to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("unreadCounts", JSON.stringify(unreadCounts));
    }
  }, [unreadCounts]);

  // 1️⃣ Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getChatContact();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 2️⃣ Subscribe to messages and update unread counts
  useEffect(() => {
    if (!currentUserId) return;

    const socket = getSocket(currentUserId);
    console.log("⚡ Socket connected:", socket.id);

    const unsubscribe = subscribeMessages((message: any) => {
      const { senderId, receiverId } = message;

      // Only increment unread if the message is to current user
      if (receiverId === currentUserId) {
        setUnreadCounts((prev) => {
          const newCount = (prev[senderId] || 0) + 1;
          console.log("🔔 Incremented unread for", senderId, "New unreadCounts:", {
            ...prev,
            [senderId]: newCount,
          });
          return { ...prev, [senderId]: newCount };
        });
      }
    });

    return () => unsubscribe?.();
  }, [currentUserId]);

  // 3️⃣ Handle selecting a user: reset their unread count
  const handleSelectUser = (user: ChatUser) => {
    setSelectedUser(user);

    setUnreadCounts((prev) => ({
      ...prev,
      [user.id]: 0,
    }));
  };

  // 4️⃣ Filter users for display
  const displayedUsers = users
    .filter((u) => u.id !== currentUserId)
    .filter((u) => (showOnlineOnly ? isUserOnline(u.id) : true));

  return (
    <div className="flex flex-col h-full bg-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b">
        <h1 className="text-xl font-bold text-white">Contacts</h1>
        <label className="flex items-center gap-1 text-white text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlineOnly}
            onChange={() => setShowOnlineOnly((prev) => !prev)}
            className="accent-green-500"
          />
          Show online only
        </label>
      </div>

      {/* User list */}
      <div className="w-full flex-1 overflow-y-auto py-2">
        {loading ? (
          <p className="text-center text-white">Users loading...</p>
        ) : displayedUsers.length === 0 ? (
          <p className="text-center text-white">
            {showOnlineOnly ? "No online users found" : "No users to show"}
          </p>
        ) : (
          displayedUsers.map((user) => {
            const online = isUserOnline(user.id);
            const unread = unreadCounts[user.id] || 0;

            return (
              <div
                key={user.id}
                className={`w-full flex items-center gap-3 mb-4 px-2 py-1 rounded cursor-pointer ${
                  selectedUser?.id === user.id
                    ? "bg-slate-600"
                    : unread > 0
                    ? "bg-slate-700"
                    : "hover:bg-slate-700"
                }`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={user.image ?? "/avatar.png"}
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    {/* Online indicator */}
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800" />
                    )}

                    {/* Unread badge */}
                    {unread > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-white">{user.name}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
