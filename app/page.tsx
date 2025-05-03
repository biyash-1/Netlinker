
import WhoToFollow from "@/components/WhotoFollow";
import CreatePost from "../components/CreatePost";
import { currentUser } from "@clerk/nextjs/server";
import { getPosts } from "./actions/post.action";
import PostCard from "@/components/PostCard";
import { getDbUserId } from "./actions/user.action";

export default async function Home() {
  const user = await currentUser();

 
  const dbUserId = await getDbUserId();      

  
  const posts = await getPosts();            

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
    {/* Left Column */}
    <div className="lg:col-span-6 space-y-6">
      {user && <CreatePost />}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            dbUserId={dbUserId}
          />
        ))}
      </div>
    </div>
  
    {/* Right Column */}
    <div className="hidden lg:block lg:col-span-4 sticky top-20">
      <WhoToFollow />
    </div>
  </div>
  );
}
