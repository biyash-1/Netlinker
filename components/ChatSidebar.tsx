// ChatSidebar.jsx

"use client"
import React, { useEffect ,useState} from 'react'
import {getChatContact} from '@/app/actions/user.action'
import { ChatUser } from '@/app/types/chat'


type ChatSidebarProps = {
    selectedUser: ChatUser | null;
    setSelectedUser: (user: ChatUser) => void;
}

const ChatSidebar = ({ selectedUser, setSelectedUser }: ChatSidebarProps) => {
  const [users, setUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    async function fetchUser() {
      const users = await getChatContact();
      setUsers(users);
    }
    fetchUser();
  }, []);

  return (
<div className="flex flex-col h-full bg-slate-800">
      <h1 className="text-center text-xl font-bold border-b py-2">Contacts</h1>
      <div className="w-full flex-1 overflow-y-auto py-2">
        {users.map((user, index) => (
          <div
            className={`w-full flex items-center gap-3 mb-4 ${
              selectedUser?.id === user.id ? "bg-slate-600" : "hover:bg-slate-100"
            }`}
            key={index}
            onClick={() => setSelectedUser(user)}
          >
            <img
              src={user.image ?? "/avatar.png"}
             
              className="w-10 h-10 rounded-full object-cover"
            />
            <p className="font-medium">{user.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar; 