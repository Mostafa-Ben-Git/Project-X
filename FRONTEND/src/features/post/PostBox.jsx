import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import useAuth from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Image, Loader2, PinIcon, SmilePlus } from "lucide-react";
import { lazy, Suspense, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePreview } from "../../components/ImagePreview";

// Lazy-load the heavy emoji picker only when the dropdown opens
const EmojiPicker = lazy(() => import("emoji-picker-react"));

function PostBox({ className, parent_id, isReplay = false }) {
  const { addPost, isFetching, isPosting } = usePosts();
  const qc = useQueryClient();

  const { user, isLoading } = useAuth();
  const [newPost, setNewPost] = useState({
    text: "",
    images: [],
  });

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleEmojiClick = ({ emoji }) => {
    const { selectionStart, selectionEnd } = textareaRef.current;
    const newText = `${newPost.text.slice(0, selectionStart)}${emoji}${newPost.text.slice(selectionEnd)}`;
    setNewPost({ ...newPost, text: newText });

    // Move caret to the end of the inserted emoji
    textareaRef.current.focus();
    textareaRef.current.selectionStart = selectionEnd + emoji.length;
    textareaRef.current.selectionEnd = selectionEnd + emoji.length;
  };

  const handleUpload = () => {
    fileInputRef.current.click();
  };

  const isEmpty = newPost.text === "" && newPost.images.length === 0;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setNewPost({ ...newPost, [name]: value });
  };

  const handleSetImage = (e) => {
    const file = e.target.files[0];
    setNewPost({
      ...newPost,
      images: [...newPost.images, file],
    });
  };

  const handleRemoveImage = (index) => {
    setNewPost({
      ...newPost,
      images: newPost.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (!isEmpty) {
      formData.append("content", newPost.text);
      if (parent_id) {
        formData.append("parent_id", parent_id);
      }
      newPost.images.forEach((image) => {
        formData.append("images[]", image);
      });
      await addPost(formData);

      setNewPost({
        text: "",
        images: [],
      });

      // Refresh TanStack feed so HomePage shows the new post immediately
      qc.invalidateQueries({ queryKey: ["posts"] });

      toast.success(`Your ${isReplay ? "reply" : "post"} has been saved.`);
      // Reset the for,
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className={cn("w-full border", className)}
    >
      <div className="my-2 flex items-center justify-between gap-3 rounded-t-lg px-2">
        <UserAvatar user={user} />
        <Textarea
          name="text"
          value={newPost.text}
          className="w-full border p-1 text-xl outline-none"
          placeholder={isReplay ? "Reply..." : "Say something..."}
          onChange={handleOnChange}
          ref={textareaRef}
        />
      </div>

      {newPost.images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-3">
          {newPost.images.map((image, index) => (
            <ImagePreview
              key={index}
              image={image}
              OnRemove={() => handleRemoveImage(index)}
              rounded="md"
              border={2}
            />
          ))}
        </div>
      )}

      <div className="flex flex-row-reverse items-center justify-between gap-2 border-t px-3 py-2">
        <Button
          type="submit"
          size="sm"
          disabled={isEmpty || isPosting}
          className="text-xs font-medium"
        >
          {isPosting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isReplay ? (
            "Reply"
          ) : (
            "Post"
          )}
        </Button>
        <div className="flex space-x-1 ps-0 sm:ps-2 rtl:space-x-reverse">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
          >
            <PinIcon />
            <span className="sr-only">Attach file</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground"
              >
                <SmilePlus />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Suspense fallback={<div className="w-64 p-2 text-sm">Loading…</div>}>
                <EmojiPicker
                  theme="dark"
                  emojiStyle="native"
                  onEmojiClick={handleEmojiClick}
                  rows={4}
                  perRow={8}
                  emojiSize={32}
                  pickerStyle={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                  }}
                />
              </Suspense>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            onClick={handleUpload}
          >
            <Image />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleSetImage}
              style={{ display: "none" }}
            />
            <span className="sr-only">Upload image</span>
          </Button>
        </div>
      </div>
    </form>
  );
}

export default PostBox;
