"use client";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { useState, useEffect, useCallback } from "react";
import { LinkIcon, MapPinIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { toggleFollow, getCurrentUserFollowingIds } from "../app/actions/user.action";

interface UserRelation {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
}

interface SidebarClientProps {
  user: {
    id: string;
    username: string;
    image: string | null;
    name: string | null;
    bio: string |null;
    location: string;
    website: string;
    _count: { following: number; followers: number };
    following: { following: UserRelation }[];
    followers: { follower: UserRelation }[];
  };
}

function RelationModal<T>({
  title,
  items,
  onClose,
  onToggle,
  currentFollowingIds,
}: {
  title: string;
  items: T[];
  onClose: () => void;
  onToggle: (id: string, wasFollowing: boolean) => void;
  currentFollowingIds: string[];
}) {
  return (
    <div className="absolute top-0 right-0 mt-2 mr-2 w-96 h-96 bg-white dark:bg-gray-900 z-10 rounded-lg shadow-lg overflow-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">{title}</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <XIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {items.map((item: any) => {
          const relation = item.following || item.follower;
          const isFollowing = currentFollowingIds.includes(relation.id);
          return (
            <div key={relation.id} className="flex items-center justify-between">
              <Link href={`/profile/${relation.username}`} className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={relation.image ?? "/avatar.png"} />
                </Avatar>
                <div>
                  <p className="font-medium">{relation.name}</p>
                  <p className="text-xs text-muted-foreground">@{relation.username}</p>
                </div>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggle(relation.id, isFollowing)}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SidebarClient({ user }: SidebarClientProps) {
  const [showModal, setShowModal] = useState<"following" | "followers" | null>(null);
  const [currentFollowingIds, setCurrentFollowingIds] = useState<string[]>(() =>
    user.following.map((f) => f.following.id)
  );

  const fetchFollowing = useCallback(async () => {
    try {
      const ids = await getCurrentUserFollowingIds();
      setCurrentFollowingIds(ids);
    } catch (err) {
      console.error("Failed to load following ids", err);
    }
  }, []);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  const handleToggle = async (targetId: string, wasFollowing: boolean) => {
    try {
      await toggleFollow(targetId);
      await fetchFollowing();
      toast.success(wasFollowing ? "User unfollowed successfully" : "User followed successfully");
    } catch (err) {
      console.error(err);
      toast.error(wasFollowing ? "Failed to unfollow" : "Failed to follow");
    }
  };

  return (
    <div className="relative top-10">
      <Card>
        <CardContent className="pt-0 text-center">
          <Link href={`/profile/${user.username}`} className="flex flex-col items-center">
            <Avatar className="w-20 h-20 border-4">
              <AvatarImage src={user.image || "/avatar.png"} />
            </Avatar>
            <h3 className="mt-4 font-semibold">{user.name || "anonomys"}</h3>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </Link>
          {user.bio && <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>}

          <div className="my-4">
            <Separator />
            <div className="flex justify-around">
              <div onClick={() => setShowModal("following")} className="cursor-pointer">
                <p className="font-medium">{user._count.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <Separator orientation="vertical" />
              <div onClick={() => setShowModal("followers")} className="cursor-pointer">
                <p className="font-medium">{user._count.followers}</p>
                <p className="text-xs  text-muted-foreground">Followers</p>
              </div>
            </div>
            <Separator className="mt-4" />
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {user.location || "No location"}
            </div>
            <div className="flex items-center">
              <LinkIcon className="w-4 h-4 mr-1" />
              {user.website ? (
                <a href={user.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                  {user.website}
                </a>
              ) : (
                "No website"
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showModal === "following" && (
        <RelationModal
          title="Following"
          items={user.following}
          currentFollowingIds={currentFollowingIds}
          onClose={() => setShowModal(null)}
          onToggle={handleToggle}
        />
      )}

      {showModal === "followers" && (
        <RelationModal
          title="Followers"
          items={user.followers}
          currentFollowingIds={currentFollowingIds}
          onClose={() => setShowModal(null)}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
}
