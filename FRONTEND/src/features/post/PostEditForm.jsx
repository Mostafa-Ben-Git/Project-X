import apiService from "@/api/apiService";
import { ImagePreview } from "@/components/ImagePreview";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import usePosts from "@/hooks/usePosts";
import { useEffect, useState } from "react";

function PostEditForm({ post_id }) {
  const [post, setPost] = useState({
    images: [],
  });
  const [fetchingPost, setFetchingPost] = useState(true);
  const { editPost } = usePosts();

  useEffect(() => {
    async function getPost() {
      try {
        const { data } = await apiService.get(`api/posts/${post_id}`);
        setPost(data);
        setFetchingPost(false);
      } catch (error) {
        console.error(error);
      }
    }

    getPost();
  }, []);

  const handleRemoveImage = (index) => {
    setPost({
      ...post,
      images: post.images.filter((_, i) => i !== index),
    });
  };

  const handleSetImage = (e) => {
    const files = Array.from(e.target.files);
    setPost((prevPost) => ({
      ...prevPost,
      images: [...(prevPost.images || []), ...files],
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(post);
    const formData = new FormData();
    formData.append("content", post.content);
    post?.images?.forEach((image) => {
      if (typeof image === "string") {
        formData.append("images[]", image);
      } else {
        formData.append("images[]", image);
      }
    });

    try {
      setFetchingPost(true);
      await editPost(post_id, formData);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingPost(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Post</DialogTitle>
        <DialogDescription>
          Make changes to your Post here. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="post_content" className="text-left text-lg font-bold">
            Post Content
          </Label>
          <Textarea
            row={2}
            id="post_content"
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            defaultValue={post?.content}
            className="col-span-3"
          />
        </div>
      </div>
      <Label
        className="mx-auto flex max-w-max cursor-pointer items-center justify-center rounded-full bg-indigo-500 p-3 text-center text-sm text-white hover:bg-indigo-700 focus:border-indigo-700 focus:outline-none focus:ring"
        htmlFor="images"
      >
        Upload Image
      </Label>
      <Input
        type="file"
        id="images"
        className="hidden"
        onChange={handleSetImage}
      />
      {post?.images?.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 rounded border p-3">
            {post.images.map((image, index) => (
              <ImagePreview
                key={index}
                image={image}
                OnRemove={() => handleRemoveImage(index)}
                rounded="md"
                border={2}
              />
            ))}
          </div>
        </>
      )}
      <DialogFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={fetchingPost}
          className="cursor-pointer"
        >
          {fetchingPost ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default PostEditForm;
