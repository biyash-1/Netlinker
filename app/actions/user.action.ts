"use server"
import { auth, currentUser } from "@clerk/nextjs/server";
import {prisma} from "../../lib/prisma"; // Adjust the import path as needed
import { revalidatePath } from "next/cache";
export async function syncUser() {
  try {
    // Get the current user's id and details
    const { userId } = await auth();
    const user = await currentUser();
    console.log("user is",user);
    

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

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      following: {
        include: {
          following: {  
            select: {
              id: true,
              username: true,
              name: true,
              image: true
            }
          }
        }
      },
      followers:{
        include:{
          follower:{
            select:{
              id:true,
              username:true,
              name:true,
              image:true,
            }
          }
        }
      },
      _count: {
        select: { followers: true, following: true }
      }
    }
  });
}
export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    // get 3 random users exclude ourselves & users that we already follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.log("Error fetching random users", error);
    return [];
  }
}


export async function getChatContact() {
  try {
  
    const userId = await getDbUserId();
    if (!userId) return [];

    const chatUsers = await prisma.user.findMany({
      where: {
      
        id: { not: userId },
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true
      }
    });

    return chatUsers;
  } catch (error) {
    console.error("Error fetching chat contacts", error);
    return [];
  }
}
// Add to your server actions
export async function getCurrentUserFollowingIds() {
  const userId = await getDbUserId();
  if (!userId) return [];

  const following = await prisma.follows.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  return following.map(f => f.followingId);
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, // user being followed
            creatorId: userId, // user following
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}