import apiService from "@/api/apiService";
import LoaderCircle from "@/components/LoaderCircle";
import Post from "@/features/post/Post";
import PostBox from "@/features/post/PostBox";
import useAuth from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { FadeLoader, MoonLoader } from "react-spinners";

function PostPage() {
  const { username, post_id } = useParams();
  const { state } = useLocation();
  const {
    // isFetching,
    // currentPost,
    // setCurrentPost,
    status,
    posts,
    // fetchComments,
    // commentPage,
    // setCommentPage,
    comments,
    setComments,
  } = usePosts();

  const { user, getUser } = useAuth();

  const [currentPost, setCurrentPost] = useState(state?.postData);
  const [isFetching, setIsFetching] = useState(true);
  // const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [isFetchingComments, setIsFetchingComments] = useState(false);

  useEffect(() => {
    if (!user) getUser();
    const fetchPostByUsernameAndId = async (username, post_id) => {
      try {
        const { data } = await apiService.get(
          `api/${username}/post/${post_id}`,
        );

        setCurrentPost(data);
        setIsFetching(false);
        console.log(data);
      } catch (error) {
        const responseData = error.response;
        console.error("Error fetching post", responseData);
      }
    };

    fetchPostByUsernameAndId(username, post_id);
  }, []);

  const fetchComments = useCallback(async (post_id, pageComment) => {
    if (pageComment === null) return;
    try {
      setIsFetchingComments(true);
      const { data } = await apiService.get(
        `api/posts/${post_id}/comments?page=${pageComment}`,
      );
      if (data.data.length > 0)
        setComments((prevComments) => [...prevComments, ...data.data]);
      if (data.links.next !== null) setCommentPage((page) => page + 1);
      else setCommentPage(null);
    } catch (error) {
      const responseData = error.response;
      setCommentPage(null);
      console.error("Error fetching comments", responseData);
    } finally {
      setIsFetchingComments(false);
    }
  }, []);

  useEffect(() => {
    setComments([]);
    fetchComments(post_id, commentPage);
  }, []);

  return isFetching && !currentPost ? (
    <LoaderCircle />
  ) : (
    <div className="w-full">
      <header className="align-center  top-0 flex bg-opacity-80 px-4 py-2 text-3xl">
        <span
          className="mr-2 cursor-pointer self-center rounded-full bg-transparent p-2 transition-all duration-100 hover:bg-slate-200"
          onClick={() => window.history.go(-1)}
        >
          <ArrowLeft />
        </span>
        Posts
      </header>
      {isFetching ? (
        <LoaderCircle />
      ) : (
        <main>
          <section>
            <Post
              {...currentPost}
              className="border-b"
              clickable={false}
              extraInfo={true}
            />
          </section>
          <section>
            <PostBox parent_id={post_id} isReplay={true} />
          </section>
          <section className="text-xs">
            <ul>
              {comments?.map((comment) => (
                <Post
                  {...comment}
                  key={`post-${comment.post_id}-${Math.random()}`}
                  className="border-b"
                  postData={comment}
                  type="replay"
                  clickable={false}
                />
              ))}
            </ul>
            {commentPage === null && (
              <div className="flex w-full items-center justify-center p-5">
                No Comments
              </div>
            )}
            {commentPage !== null && (
              <div className="flex w-full items-center justify-center p-5">
                <span
                  className="cursor-pointer underline"
                  onClick={() => fetchComments(post_id, commentPage)}
                >
                  {isFetchingComments ? (
                    <FadeLoader color="#ffffff" size={16} />
                  ) : (
                    "Load more"
                  )}
                </span>
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

export default PostPage;
