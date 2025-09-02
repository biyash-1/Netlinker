"use client"
import  {useState} from 'react'
import React from 'react'
import ChatSidebar from '@/components/ChatSidebar'
import ChatHeader from '@/components/ChatHeader'
import { ChatUser } from '@/app/types/chat'
import ChatInput from '@/components/ChatInput'
import ChatContainer from '@/components/ChatContainer'
import { useAuth } from '@clerk/nextjs'

const page = () => {
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
     const { userId } = useAuth();

  return (
    <div className='flex justify-center items-start h-screen bg-slate-900 pt-12'>
        <div className='border  rounded-lg h-[600px] w-[800px] flex  justify-between items-center mb-8'>
           <div className="sidebar flex flex-col  w-[25%] border border-r h-full">
                <ChatSidebar  selectedUser= {selectedUser} setSelectedUser={setSelectedUser}/>
           </div>
         <div className="chatcontent flex flex-col w-[75%] h-full">
  {/* Header */}
  <div className="h-12 w-full border-b flex items-center bg-slate-700">
    <ChatHeader selectedUser={selectedUser} />
  </div>

  {/* Chat messages (take remaining height) */}
  <div className="flex-1 overflow-y-auto w-full">
    <ChatContainer selectedUser={selectedUser} currentUserId={userId!} />
  </div>

  {/* Input at bottom */}
  <div className="border-t w-full">
    {selectedUser && <ChatInput receiverId={selectedUser.id} />}
  </div>
</div>
        </div>
    
 
    </div>
  )
}

export default page
