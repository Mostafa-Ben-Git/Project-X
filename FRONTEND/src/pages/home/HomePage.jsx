import Post from "features/post/Post";
import usePost from "hooks/usePost";
import { MoonLoader } from "react-spinners";

function HomePage() {
  const { isFetching, posts, lastPostRef, hasNextPage } = usePost();

  return (
    <main>
      <ul className="flex flex-wrap justify-center gap-4">
        {posts?.map((post, i, posts) => (
          <li
            key={post.post_id}
            ref={posts.length - 1 === i ? lastPostRef : undefined}
          >
            <Post {...post} key={post.post_id} />
          </li>
        ))}
      {isFetching && (
        <div className=" w-full flex items-center justify-center rounded-lg bg-slate-400 p-5">
          <MoonLoader color="#ffffff" size={30} />
        </div>
      )}
      {!hasNextPage && <p>No more posts</p>}
      </ul>
    </main>
  );
}

export default HomePage;
