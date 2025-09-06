import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../lib/prisma";
import { create } from "domain";
import { revalidatePath } from "next/cache";

export async function getMessages(otherUserId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return [];

    // Get the current user from our database
    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!currentUser) return [];

    const chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUser.id },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!chat) return [];

    const formattedMessages = chat.messages.map((message) => ({
      id: message.id,
      content: message.content,
      image: message.image,
      createdAt: message.createdAt,
      isSender: message.senderId === currentUser.id,
      senderId: message.senderId,
      receiverId:
        message.senderId === currentUser.id ? otherUserId : currentUser.id,
    }));

    return formattedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export async function sendMessage(
  receiverId: string,
  content: string,
  image?: string
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;
    console.log("Authenticated user ID:", clerkId);

    // Get the current user from our database
    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!currentUser) return null;

    // Find or create a chat between current user and receiver
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId },
          { senderId: receiverId, receiverId: currentUser.id },
        ],
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          senderId: currentUser.id,
          receiverId,
        },
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: currentUser.id,
        content,
        image,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/chat");
    return {
      id: message.id,
      content: message.content,
      image: message.image,
      createdAt: message.createdAt,

      senderId: message.senderId,
      receiverId,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
    });
    if (!currentUser) return null;

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message || message.senderId !== currentUser.id) {
      throw new Error("not authorized to delete");
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    revalidatePath("/chat");

    return { sucees: true, messageId, message: "message delete sucessfully" };
  } catch (error) {
    console.error("Error deleting message:", error);
    return null;
  }
}


export async function editMessage() {
  try{
   
  }

  catch(error) {
    
  }
}
