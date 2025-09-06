
import CreatePost from "@/components/CreatePost";
import { currentUser } from "@clerk/nextjs/server";
import { getPosts } from "./actions/post.action";
import PostCard from "@/components/PostCard";
import { getDbUserId } from "./actions/user.action";
import Sidebar from "@/components/Sidebar";
import WhoToFollow from "@/components/WhotoFollow";
export default async function Home() {
  const user = await currentUser();
  const dbUserId = await getDbUserId();
  const posts = await getPosts();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">
        {/* Sidebar only on home */}
        <div className="hidden lg:block lg:col-span-3">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="lg:col-span-6 space-y-7 py-5">
          {user && <CreatePost />}
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} dbUserId={dbUserId} />
            ))}
          </div>
        </div>

        {/* Who to follow widget */}
        <div className="hidden lg:block lg:col-span-3 sticky top-20">
          <WhoToFollow />
        </div>
      </div>
    </div>
  );
}
