
import { auth, currentUser } from "@clerk/nextjs/server";
import {prisma} from "../../lib/prisma"; // Adjust the import path as needed

export async function syncUser() {
  try {
    // Get the current user's id and details
    const { userId } = await auth();
    const user = await currentUser();

    // If the user is not logged in or user details are unavailable, exit the function
    if (!userId || !user) return;

    // Check if the user already exists in your database
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    // Create a new user entry in the database
    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        username:
          user.username ??
          user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error syncing user:", error);
    throw error;
  }


}

export async function getUserByClerkId(clerkId:string){
 
return prisma.user.findUnique({
  where:{
    clerkId,
  },
  include:
  {
    _count:{
      select:{
        followers:true,
        following:true,
        posts:true
      }
    }
  }

})
 
}
