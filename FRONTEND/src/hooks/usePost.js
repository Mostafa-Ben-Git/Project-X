import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPosts } from "../slices/postsSlice";

export default function usePost() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { errors, isLoading, posts } = useSelector((store) => store.posts);

  const getPosts = () => {
    dispatch(fetchPosts());
  };
  return { errors, isLoading, posts, getPosts };
}
