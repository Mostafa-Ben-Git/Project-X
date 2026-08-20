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
import ImageLightbox from "@/components/ImageLightbox";

// Lazy-load the heavy emoji picker only when the dropdown opens
const EmojiPicker = lazy(() => import("emoji-picker-react"));

function PostBox({ className, parent_id, isReplay = false }) {
  const { addPost, isPosting } = usePosts();
  const qc = useQueryClient();

  const { user } = useAuth();
  const [newPost, setNewPost] = useState({
    text: "",
    images: [],
  });

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const previewUrls = newPost.images.map((image) =>
    typeof image === "string" || image instanceof String
      ? image
      : URL.createObjectURL(image),
  );

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
      formData.append("content", newPost.text || "");
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
      className={cn("w-full border-b border-border", className)}
    >
      <div className="flex gap-3 px-4 pt-3">
        <UserAvatar user={user} className="h-10 w-10 shrink-0" />
        <Textarea
          name="text"
          value={newPost.text}
          className="w-full resize-none border-0 bg-transparent p-0 text-lg outline-none focus-visible:ring-0 min-h-[80px]"
          placeholder={isReplay ? "Reply..." : "What is happening?!"}
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
              onExpand={() => setLightboxIndex(index)}
              rounded="md"
              border={2}
            />
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          src={previewUrls[lightboxIndex]}
          images={previewUrls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(dir) =>
            setLightboxIndex((prev) =>
              dir === "next"
                ? (prev + 1) % newPost.images.length
                : (prev - 1 + newPost.images.length) % newPost.images.length,
            )
          }
        />
      )}

      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <div className="flex space-x-1 ps-0 sm:ps-2 rtl:space-x-reverse">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-blue-600"
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
                className="h-9 w-9 text-blue-600"
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
            className="h-9 w-9 text-blue-600"
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
        <Button
          type="submit"
          disabled={isEmpty || isPosting}
          className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
        >
          {isPosting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isReplay ? (
            "Reply"
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </form>
  );
}

export default PostBox;
