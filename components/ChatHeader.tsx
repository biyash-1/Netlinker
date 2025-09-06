
import { ChatUser } from '@/app/types/chat'

type ChatHeaderProps = {
  selectedUser: ChatUser | null;
}

const ChatHeader = ({ selectedUser }: ChatHeaderProps) => {
  return (
    <div className=' flex items-center  '>
      {selectedUser ? (
        <h2 className="text-xl font-bold ">{selectedUser.name}</h2>
      ) : (
        <h2 className="text-xl font-bold mb-4">Select a user</h2>
      )}
    </div>
  )
}

export default ChatHeader
