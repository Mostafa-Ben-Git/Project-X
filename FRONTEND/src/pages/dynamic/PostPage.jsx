import Post from "@/features/post/Post";
import Comment from "@/features/post/Comment";
import usePosts from "@/hooks/usePosts";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";

function PostPage() {
  const { username, post_id } = useParams();
  const { getPostByUsername, isFetching, currentPost, setPosts } = usePosts();

  useEffect(() => {
    getPostByUsername(username, post_id);
  }, []);

  function updatePost(post_id) {
    setPosts((prevPosts) => {
      return prevPosts.map((post) => {
        if (post.post_id === currentPost.post.post_id) {
          return currentPost.post;
        } else {
          return post;
        }
      });
    });
  }

  return (
    <div className="position-relative w-full">
      <header className="align-center  top-0 flex bg-slate-400 bg-opacity-80 px-4 py-2 text-3xl">
        <span
          className="mr-2 cursor-pointer self-center rounded-full bg-transparent p-2 transition-all duration-100 hover:bg-slate-200"
          onClick={() => window.history.go(-1)}
        >
          <ArrowLeft />
        </span>
        Posts
      </header>
      <main>
        <section>
          {isFetching ? (
            <div className="flex w-full items-center justify-center rounded-lg bg-slate-400 p-5">
              <MoonLoader color="#ffffff" size={30} />
            </div>
          ) : (
            currentPost && <Post {...currentPost.post} className="border-b" />
          )}
        </section>
        <section>
          {currentPost && (
            <ul>
              {currentPost?.comments?.map((comment) => {
                return <Comment key={comment.comment_id} {...comment} />;
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default PostPage;
