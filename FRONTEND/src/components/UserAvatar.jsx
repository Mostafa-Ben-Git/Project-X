import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

function UserAvatar({ user, className }) {
  return (
    <Avatar className={cn("rounded-full", className)}>
      <AvatarImage src={user?.avatar} alt="@shadcn" className="rounded-full w-20 h-20" />
      <AvatarFallback className="rounded-full w-20 h-20">
        {user?.first_name[0] + " " + user?.last_name[0]}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
