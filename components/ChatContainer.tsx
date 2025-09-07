"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChatUser } from "@/app/types/chat";
import { useUser } from "@clerk/nextjs";
import { getSocket } from "@/lib/socket";
import { AiOutlineEdit } from "react-icons/ai";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isSender: boolean;
  image?: string;
}

interface ChatContainerProps {
  selectedUser: ChatUser | null;
  currentUserId: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  selectedUser,
  currentUserId,
  messages,
  setMessages,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const currentUserAvatar = user?.imageUrl;
  const shouldAutoScroll = useRef(true);
  const [loading, setLoading] = useState(true);

 
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Fetch messages when user selected
  useEffect(() => {
    if (!selectedUser) return;

    setLoading(true);
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/send?receiverId=${selectedUser.id}`);
        const data = await res.json();
        if (res.ok) {
          setMessages(data);
          shouldAutoScroll.current = true;
        } else {
          console.error("Failed to fetch messages:", data);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, setMessages]);

  useEffect(() => {
  // Do nothing if no user is selected or currentUserId is missing
  if (!currentUserId || !selectedUser) return;

  const socket = getSocket(currentUserId);

  const handleReceive = (message: ChatMessage) => {
    // Only handle messages relevant to the current chat
    const isRelevant =
      (message.senderId === currentUserId || message.receiverId === currentUserId) &&
      (message.senderId === selectedUser.id || message.receiverId === selectedUser.id);

    if (!isRelevant) return;

    const withFlag = {
      ...message,
      isSender: message.senderId === currentUserId,
    };

    setMessages((prev) => {
      // Avoid duplicate messages
      if (prev.some((m) => m.id === message.id)) return prev;

      const container = containerRef.current;
      if (container) {
        const isAtBottom =
          container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
        shouldAutoScroll.current = isAtBottom;
      }

      return [...prev, withFlag];
    });
  };

  socket.on("message", handleReceive);

  return () => {
    socket.off("message", handleReceive);
  };
}, [currentUserId, selectedUser, setMessages]);


  // Auto scroll
  useEffect(() => {
    if (bottomRef.current && shouldAutoScroll.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (container) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      shouldAutoScroll.current = isAtBottom;
    }
  };

  // Edit handlers
  const handleEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId) return;

    try {
     const res =  await fetch("/api/chat/send", {
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: editingMessageId, content: editContent }),
      });

      const data = await res.json();
      console.log("from bacekned",data)

      // Update local state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingMessageId ? { ...m, content: editContent } : m
        )
      );
      toast.success("Message edited successfully");

      setEditingMessageId(null);
      setEditContent("");
    } catch (err) {
      console.error("Failed to edit message:", err);
    }
  };

  const handleDelete = async (index: number) => {
    const messageId = messages[index].id;

    try {
      await fetch("/api/chat/send", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });

      setMessages((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex justify-center items-center h-full text-slate-400">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-slate-800 p-4"
      onScroll={handleScroll}
      style={{
        position: "relative",
        height: "100%",
        overflowAnchor: "none",
      }}
    >
      <div className="flex flex-col space-y-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md ${
                    i % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  } items-end gap-2`}
                >
                  <div className="w-8 h-8 bg-slate-600 rounded-full animate-pulse" />
                  <div className="flex flex-col space-y-2">
                    <div className="w-20 h-3 bg-slate-600 rounded animate-pulse" />
                    <div className="w-32 h-4 bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          : messages.map((msg, index) => {
              const isSender = msg.senderId === currentUserId;
              const isEditing = editingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`group flex max-w-xs lg:max-w-md ${
                      isSender ? "flex-row-reverse" : "flex-row"
                    } items-end gap-2 relative`}
                  >
                    {/* Avatar */}
                    <img
                      src={
                        isSender
                          ? currentUserAvatar || "/avatar.png"
                          : selectedUser?.image || "/avatar.png"
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />

                    {/* Message container */}
                    <div
                      className={`relative flex flex-col ${
                        isSender ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Name + Time */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-300">
                          {isSender ? "You" : selectedUser?.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Editing vs Normal */}
                      {isEditing ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="px-2 py-1 rounded bg-slate-700 text-slate-200 outline-none"
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="px-2 py-1 bg-green-500 text-white rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="px-2 py-1 bg-gray-500 text-white rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* Dropdown for sender */}
                          {isSender && (
                            <div className="opacity-0 group-hover:opacity-100 transition">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 rounded-full hover:bg-slate-700 flex items-center justify-center">
                                    <AiOutlineEdit size={18} className="text-gray-400" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-28 bg-slate-800 text-slate-200 border border-slate-700">
                                  <DropdownMenuItem onClick={() => handleEdit(msg)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-400"
                                    onClick={() => handleDelete(index)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}

                          {/* Normal message */}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isSender
                                ? "bg-blue-600 text-white"
                                : "bg-slate-700 text-slate-200"
                            }`}
                          >
                            {msg.content}
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="image"
                                className="w-[200px] h-auto object-cover mt-2 rounded-lg"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatContainer;
