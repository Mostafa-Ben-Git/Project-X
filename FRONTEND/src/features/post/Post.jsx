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
import usePosts from "@/hooks/usePosts";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Dot, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserHoverCart } from "../../components/UserHoverCart";
import { ImagesCarousel } from "./ImagesCarousel";
import PostInfo from "./PostInfo";

import {
    Dialog,
    DialogTrigger
} from "@/components/ui/dialog";

import useAuth from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import PostEditForm from "./PostEditForm";

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
  extraInfo = false,
}) {
  const nav = useNavigate();

  const { isDeleting, deletePost } = usePosts();
  const { user: currentUser } = useAuth();

  const handelClick = (e) => {
    e.stopPropagation();
    nav(`/${user.username}/post/${post_id}`, {
      state: {
        postData,
      },
    });
  };
  return (
    <li
      className={cn(
        "relative w-full list-none overflow-hidden border-b border-border p-4",
        className,
      )}
      ref={innerRef}
    >
      {currentUser.username === user.username && (
        <div className="absolute right-3 top-3">
          <AlertDialog>
            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex flex-col gap-2 p-2">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Delete Post</Button>
                  </AlertDialogTrigger>
                  <DialogTrigger asChild>
                    <Button variant="outline">Edit Post</Button>
                  </DialogTrigger>
                  <PostEditForm post_id={post_id} />
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your Post and remove your data from our servers.
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
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </Dialog>
          </AlertDialog>
        </div>
      )}
      <div className="flex items-center">
        <span>
          <Avatar className="h-12 w-12">
              <AvatarImage
                src={user.avatar}
                className="aspect-square h-full w-full rounded-full object-cover"
              />
            <AvatarFallback>
              {user.first_name[0]}
              {user.last_name[0]}
            </AvatarFallback>
          </Avatar>
        </span>
        <div className=" ml-4 space-x-4">
          <UserHoverCart user={user} />
          <span className="text-sm text-muted-foreground">{dates.ago}</span>
        </div>
      </div>
      <p
        className={cn(
          "mt-4 cursor-pointer whitespace-pre-wrap break-words text-base leading-relaxed text-foreground",
          clickable && "transition-opacity hover:opacity-90",
        )}
        dangerouslySetInnerHTML={{ __html: content }}
        {...(clickable && { onClick: handelClick })}
      ></p>

      {images && <ImagesCarousel images={images} />}

      {extraInfo && (
        <div className="mt-4 flex items-center space-x-2 border-y-2 text-sm">
          <p>{dates.time}</p>
          <Dot size={40} />
          <p>{dates.date}</p>
        </div>
      )}
      <PostInfo {...info} post_id={post_id} postData={postData} replay={type === "replay"} />
    </li>
  );
}
export default Post;
