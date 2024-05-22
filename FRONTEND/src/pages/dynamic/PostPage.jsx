import Post from "@/features/post/Post";
import Comment from "@/features/post/Comment";
import usePosts from "@/hooks/usePosts";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import ReplayBox from "@/features/post/ReplayBox";

function PostPage() {
  const { username, post_id } = useParams();
  const {
    isFetching,
    currentPost,
    setCurrentPost,
    status,
    posts,
    comments,
    fetchComments,
    commentPage,
  } = usePosts();

  useEffect(() => {
    fetchComments(post_id, commentPage);
  }, []);

  useEffect(() => {
    const post = posts.find(
      (post) => post.post_id == post_id && post.user.username == username,
    );
    setCurrentPost(post);
  }, [commentPage, fetchComments, post_id, posts, setCurrentPost, username]);

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
            currentPost && (
              <Post {...currentPost} className="border-b" clickable={false} />
            )
          )}
        </section>
        <section>
          <ReplayBox />
        </section>
        <section>
          {status === "fetching_comments" && comments.length === 0 ? (
            <div className="flex w-full items-center justify-center rounded-lg bg-slate-400 p-5">
              <MoonLoader color="#ffffff" size={30} />
            </div>
          ) : (
            <ul>
              {comments?.map((comment) => (
                <Post {...comment} key={comment.id} className="border-b" />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default PostPage;
