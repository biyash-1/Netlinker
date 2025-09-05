"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { IoIosSend } from "react-icons/io";
import { ImageIcon, Loader2 } from "lucide-react";
import { getSocket } from "@/lib/socket";
import toast from "react-hot-toast";
import { UploadDropzone } from "@/lib/uploadthing";

interface ChatInputProps {
  receiverId: string;
  currentUserId: string;
  onMessageSent?: (msg: any) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  receiverId,
  currentUserId,
  onMessageSent,
}) => {
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const handleSend = async () => {
    if (!receiverId || (!message.trim() && !imageUrl)) return;

    setSending(true);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, content: message, image: imageUrl }),
      });

      const sentMessage = await res.json();

      if (res.ok) {
        onMessageSent?.(sentMessage);
        setMessage("");
        setImageUrl(null);
        setShowUpload(false);

        const socket = getSocket(currentUserId);
        socket.emit("message", sentMessage);
      } else {
        toast.error(sentMessage.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full border-t p-2 flex flex-col gap-2">
      {/* Image preview */}
      {imageUrl && (
        <div className="relative w-32 h-32 mb-2">
          <img
            src={imageUrl}
            alt="preview"
            className="w-full h-full object-cover rounded-md"
          />
          <button
            type="button"
            className="absolute top-0 right-0 p-1 bg-red-500 rounded-full text-white"
            onClick={() => setImageUrl(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* UploadThing Dropzone */}
    {showUpload && (
  <UploadDropzone
    className="w-32 h-[200px] border-dashed rounded-md flex items-center justify-center"
    endpoint="postImage"
    onClientUploadComplete={(res) => {
      console.log("Upload result:", res);
      if (res?.[0]?.url) setImageUrl(res[0].url);
    }}
    onUploadError={(err) => console.error("Upload error:", err)}
  />
)}

      <div className="flex items-center gap-2">
        {/* Image icon */}
        <button
          type="button"
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => setShowUpload((prev) => !prev)}
          disabled={sending}
        >
          <ImageIcon className="w-6 h-6 text-gray-500" />
        </button>

        {/* Text input */}
        <Input
          placeholder="Send a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        {/* Send button */}
        <button
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={handleSend}
          disabled={sending || (!message.trim() && !imageUrl)}
        >
          {sending ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <>
              <span>Send</span>
              <IoIosSend className="ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
