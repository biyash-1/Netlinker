
import { NextRequest, NextResponse } from "next/server";
import { sendMessage,getMessages, deleteMessage } from "@/app/actions/chat.action";

export async function POST(req: NextRequest) {
  try {
    const { receiverId, content, image } = await req.json();
    console.log("Received message data:", { receiverId, content, image });

    
    if (!receiverId || (!content && !image)) {
      return NextResponse.json(
        { error: "Receiver ID and content or image are required" },
        { status: 400 }
      );
    }

    const message = await sendMessage(receiverId, content, image);

    if (!message) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json(message);
  } catch (err) {
    console.error("Error in send message API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const receiverId = url.searchParams.get("receiverId");

    if (!receiverId) {
      return NextResponse.json(
        { error: "receiverId query parameter is required" },
        { status: 400 }
      );
    }

    const messages = await getMessages(receiverId);
    console.log("Fetched messages:", messages);
    return NextResponse.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { messageId } = await req.json();

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      );
    }

    const result = await deleteMessage(messageId);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to delete message" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in delete message API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
