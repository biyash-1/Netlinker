"use client";
import { useState, useEffect } from "react";
import React from "react";
import ChatSidebar from "@/components/ChatSidebar";
import ChatHeader from "@/components/ChatHeader";
import { ChatUser } from "@/app/types/chat";
import ChatInput from "@/components/ChatInput";
import ChatContainer from "@/components/ChatContainer";

interface DbUser {
  id: string;      // Prisma user.id
  clerkId: string; // Clerk userId
  name: string;
}

const Page = () => {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<DbUser | null>(null);

  // Fetch the current Prisma user (not Clerk user)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data);
        } else {
          console.error("Failed to load current user:", data);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchUser();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        Loading chat…
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start h-screen bg-slate-900 pt-12">
      <div className="border rounded-lg h-[600px] w-[800px] flex justify-between items-center mb-8 ">
        {/* Sidebar */}
        <div className="sidebar flex flex-col w-[25%] border-r h-full">
          <ChatSidebar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>

        {/* Chat area */}
        <div className="chatcontent flex flex-col w-[75%] h-full">
          {/* Header */}
          <div className="h-12 w-full border-b flex items-center bg-slate-700 text-white px-3">
            <ChatHeader selectedUser={selectedUser} />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto w-full">
            <ChatContainer
              selectedUser={selectedUser}
              currentUserId={currentUser.id}   // ✅ Prisma ID
              messages={messages}
              setMessages={setMessages}
            />
          </div>

          {/* Input */}
          <div className="border-t w-full">
            {selectedUser && (
              <ChatInput
                currentUserId={currentUser.id}   // ✅ Prisma ID
                receiverId={selectedUser.id}     // ✅ Prisma ID
                onMessageSent={(newMessage) =>
                  setMessages((prev) => [...prev, newMessage])
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
