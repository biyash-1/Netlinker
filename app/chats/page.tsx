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
        <div className="animate-pulse">Loading chat…</div>
      </div>
    );
  }

  return (
    

    <div className=" flex justify-center items-center min-h-screen bg-slate-900 p-4">
      <div className="flex  rounded-xl flex-1  overflow-hidden shadow-xl w-full max-w-5xl h-[80vh]">
        {/* Sidebar */}
        <div className="w-1/4 min-w-[220px] bg-slate-800 border-r border-slate-700">
          <ChatSidebar
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-col w-3/4 bg-slate-800">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="h-16 border-b border-slate-700 flex items-center px-4 bg-slate-800">
                <ChatHeader selectedUser={selectedUser} />
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto">
                <ChatContainer
                  selectedUser={selectedUser}
                  currentUserId={currentUser.id}
                  messages={messages}
                  setMessages={setMessages}
                />
              </div>

              {/* Input */}
              <div className="border-t border-slate-700 p-4 bg-slate-800">
                <ChatInput
                  currentUserId={currentUser.id}
                  receiverId={selectedUser.id}
                  onMessageSent={(newMessage) =>
                    setMessages((prev) => [...prev, newMessage])
                  }
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <div className="text-center p-8">
                <div className="text-5xl mb-4">💬</div>
                <h2 className="text-xl font-semibold mb-2">Welcome to Chat</h2>
                <p>Select a contact to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  
  );
};

export default Page;