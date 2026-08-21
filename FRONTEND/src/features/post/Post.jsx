import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import usePosts from "@/hooks/usePosts";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Loader2, Pin, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { togglePinPost } from "@/api/posts";
import { UserHoverCart } from "../../components/UserHoverCart";
import { ImagesCarousel } from "./ImagesCarousel";
import PostInfo from "./PostInfo";
import PostEditForm from "./PostEditForm";
import { usePostView } from "@/hooks/usePostView";

function Post({
  content,
  dates,
  images,
  user,
  info,
  post_id,
  postData,
  className,
  innerRef,
  type = "post",
  clickable = true,
  is_pinned = false,
}) {
  const nav = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isDeleting, deletePost } = usePosts();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const viewRef = usePostView(post_id);

  const handleTogglePin = async () => {
    setDropdownOpen(false);
    try {
      await togglePinPost(post_id);
      queryClient.invalidateQueries({ queryKey: ["profile", currentUser?.id] });
      toast.success(is_pinned ? "Unpinned from profile" : "Pinned to profile");
    } catch {
      toast.error("Could not update pin");
    }
  };

  // Guard against null user (e.g. when loaded from URL without state)
  if (!user) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    nav(`/${user.username}/post/${post_id}`, { state: { postData } });
  };

  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`;
  const safeContent = DOMPurify.sanitize(content);
  const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
    (content || "").replace(/<[^>]*>/g, "")
  );

  // Merge intersection refs: infinite scroll sentinel + view tracking
  const setRefs = (el) => {
    if (typeof innerRef === "function") innerRef(el);
    else if (innerRef) innerRef.current = el;
    viewRef(el);
  };

  return (
    <li
      ref={setRefs}
      className={cn(
        "relative w-full list-none overflow-hidden border-b border-border p-3 transition-colors hover:bg-accent/30 sm:p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0 sm:h-10 sm:w-10">
            <AvatarImage
              src={user.avatar}
              alt={`${user.first_name} ${user.last_name}`}
              className="aspect-square h-full w-full rounded-full object-cover"
            />
            <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <UserHoverCart user={user} />
            <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
              {dates.ago}
              {is_pinned && (
                <span className="inline-flex items-center gap-0.5 text-primary">
                  <Pin size={12} />
                  Pinned
                </span>
              )}
            </span>
          </div>
        </div>

        {currentUser.username === user.username && (
          <AlertDialog>
            <Dialog>
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Post options"
                    className="h-9 w-9 shrink-0"
                  >
                    <Settings size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex w-44 flex-col gap-1 p-2">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Button variant="ghost" className="justify-start" onClick={handleTogglePin}>
                    {is_pinned ? "Unpin from profile" : "Pin to profile"}
                  </Button>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="justify-start" onClick={() => setDropdownOpen(false)}>
                      Edit post
                    </Button>
                  </DialogTrigger>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive hover:text-destructive"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Delete post
                    </Button>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <PostEditForm post_id={post_id} />

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action can&apos;t be undone. The post and its data will
                    be permanently removed from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isDeleting}
                    onClick={() => deletePost(post_id)}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </Dialog>
          </AlertDialog>
        )}
      </div>

      <p
        dir={isArabic ? "rtl" : "ltr"}
        className={cn(
          "mt-3 px-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground",
          isArabic ? "text-right" : "text-left",
          clickable && "cursor-pointer transition-opacity hover:opacity-90",
        )}
        dangerouslySetInnerHTML={{ __html: safeContent }}
        {...(clickable && { onClick: handleClick })}
      />

      {images && <ImagesCarousel images={images} />}

      <PostInfo
        {...info}
        post_id={post_id}
        postData={postData}
        replay={type === "replay"}
      />
    </li>
  );
}

export default Post;