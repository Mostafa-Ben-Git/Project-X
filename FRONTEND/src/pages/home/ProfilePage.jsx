import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useProfileTabs } from "@/hooks/useProfileTabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Post from "@/features/post/Post";
import { EmptyState } from "@/components/empty-state";

function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProfileTabs(user?.id, activeTab);

  const posts = data?.pages?.flatMap((p) => p.data) ?? [];

  const observerRef = useRef();
  const lastPostRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl">
      {/* Cover */}
      <div className="relative h-48 bg-muted">
        {user.cover_image && (
          <img src={user.cover_image} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>

      {/* Profile header */}
      <div className="relative px-4 pb-4">
        <div className="-mt-16 flex items-end justify-between">
          <Avatar className="h-28 w-28 border-4 border-background">
            <AvatarImage src={user.avatar} loading="lazy" />
            <AvatarFallback className="text-2xl">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <Link to="/settings/profile">
            <Button variant="outline" size="sm">Edit profile</Button>
          </Link>
        </div>

        <h2 className="mt-2 text-xl font-bold">{user.first_name} {user.last_name}</h2>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        {user.bio && <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>}

        <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{user.followers_count ?? 0}</strong> followers</span>
          <span><strong className="text-foreground">{user.following_count ?? 0}</strong> following</span>
          <span><strong className="text-foreground">{user.posts_count ?? 0}</strong> posts</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="border-t">
        <TabsList className="w-full rounded-none">
          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          <TabsTrigger value="replies" className="flex-1">Replies</TabsTrigger>
          <TabsTrigger value="likes" className="flex-1">Likes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState title="Nothing here yet" message={`No ${activeTab} to show.`} />
          ) : (
            <div className="divide-y">
              {posts.map((post, i) => (
                <Post
                  key={post.post_id}
                  {...post}
                  postData={post}
                  innerRef={i === posts.length - 1 ? lastPostRef : undefined}
                  className="cursor-pointer"
                />
              ))}
            </div>
          )}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default ProfilePage;
