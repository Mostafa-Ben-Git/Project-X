import LoaderCircle from "@/components/LoaderCircle";
import Post from "@/features/post/Post";
import PostBox from "@/features/post/PostBox";
import usePosts from "@/hooks/usePosts";

function HomePage() {
  const { isFetching, posts, lastPostRef, hasNextPage } = usePosts();

  return (
    <main className="w-full p-2">
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        <PostBox className="rounded-md border p-2" />

        {posts?.map((post, i) => (
          <Post
            {...post}
            postData={post}
            key={`post-${post.post_id}`}
            className="cursor-pointer rounded-md border"
            innerRef={i === posts.length - 1 ? lastPostRef : undefined}
          />
        ))}

        {isFetching && (
          <div className="flex justify-center py-6">
            <LoaderCircle />
          </div>
        )}

        {!hasNextPage && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No more posts
          </p>
        )}
      </div>
    </main>
  );
}

export default HomePage;
