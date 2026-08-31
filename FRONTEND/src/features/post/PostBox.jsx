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
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePreview } from "../../components/ImagePreview";
import ImageLightbox from "@/components/ImageLightbox";

// Lazy-load the heavy emoji picker only when the dropdown opens
const EmojiPicker = lazy(() => import("emoji-picker-react"));

const MAX_LENGTH = 280;

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

  // Auto-resize textarea for mobile: grows with content up to max height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [newPost.text]);

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
    if (!file) return;
    setNewPost({
      ...newPost,
      images: [...newPost.images, file],
    });
    // Reset input so same file can be selected again
    e.target.value = "";
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

  const charCount = newPost.text.length;
  const showCounter = charCount > MAX_LENGTH * 0.7;
  const isOverLimit = charCount > MAX_LENGTH;

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className={cn(
        "w-full border-0 border-b border-border bg-card rounded-none shadow-none",
        "overflow-hidden",
        className
      )}
    >
      <div className="flex gap-2.5 px-3 pt-3 sm:gap-3 sm:px-4">
        <UserAvatar user={user} className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
        <Textarea
          name="text"
          value={newPost.text}
          rows={1}
          maxLength={MAX_LENGTH + 50}
          className="max-h-[160px] min-h-[56px] w-full resize-none rounded-none border-0 bg-transparent p-0 text-[16px] leading-6 shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none sm:min-h-[80px] sm:text-lg"
          placeholder={isReplay ? "Post your reply" : "What is happening?!"}
          onChange={handleOnChange}
          ref={textareaRef}
        />
      </div>

      {newPost.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-3">
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

      <div className="flex items-center justify-between gap-2 border-0 border-t border-border bg-card px-2 py-2 sm:px-3 rounded-none">
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-primary sm:h-9 sm:w-9"
            aria-label="Attach file"
          >
            <PinIcon className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-primary sm:h-9 sm:w-9"
                aria-label="Add emoji"
              >
                <SmilePlus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="p-0">
              <Suspense fallback={<div className="w-64 p-3 text-sm">Loading…</div>}>
                <EmojiPicker
                  theme="dark"
                  emojiStyle="native"
                  onEmojiClick={handleEmojiClick}
                  rows={3}
                  perRow={7}
                  emojiSize={28}
                />
              </Suspense>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-primary sm:h-9 sm:w-9"
            onClick={handleUpload}
            aria-label="Upload image"
          >
            <Image className="h-5 w-5" />
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
        <div className="flex items-center gap-2">
          {showCounter && (
            <span
              className={cn(
                "text-xs tabular-nums",
                isOverLimit ? "font-medium text-destructive" : charCount > MAX_LENGTH * 0.9 ? "text-orange-500" : "text-muted-foreground"
              )}
            >
              {charCount}/{MAX_LENGTH}
            </span>
          )}
          <Button
            type="submit"
            disabled={isEmpty || isPosting || isOverLimit}
            className="min-h-9 rounded-full bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
      </div>
    </form>
  );
}

export default PostBox;
