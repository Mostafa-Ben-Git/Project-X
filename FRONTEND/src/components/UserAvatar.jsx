import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { User } from "lucide-react";

function UserAvatar({ className }) {
  const { user } = useAuth();
  return (
    <Avatar className={cn("rounded-full", className)}>
      <AvatarImage src={user?.avatar} alt="@shadcn" className="rounded-full" />
      <AvatarFallback className="rounded-full">
        <User className="aspect-square w-full" />
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
