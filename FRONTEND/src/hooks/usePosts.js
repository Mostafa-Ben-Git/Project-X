import { PostsContext } from "@/context/PostsContext";
import { useContext } from "react";

export default function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined)
    throw new Error("PostsContext was used outside the PostsProvider");
  return context;
}
