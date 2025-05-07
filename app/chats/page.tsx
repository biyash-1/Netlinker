'use client';
import React, { useState, useEffect } from 'react';
import ChatSidebar, { User } from '@/components/ChatSidebar';
import ChatContainer from '@/components/ChatContainer';
import { getChatContact } from '@/app/actions/user.action';

export default function ChatPage() {
  const [contacts, setContacts] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
  
    getChatContact().then((list) => setContacts(list));
  }, []);

  return (
    <div className="flex justify-center h-screen items-start">
      <div className="border h-[90vh] w-full max-w-6xl  shadow-lg rounded-lg overflow-hidden flex">
        <div className="w-1/4">
          <ChatSidebar
            contacts={contacts}
            selectedUser={selectedUser}
            onSelect={setSelectedUser}
          />
        </div>
        <div className="w-3/4 p-6">
          <ChatContainer selectedUser={selectedUser} />
        </div>
      </div>
    </div>
  );
}
