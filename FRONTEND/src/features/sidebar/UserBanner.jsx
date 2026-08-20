import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useAuth from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { LogOut, MoreHorizontal, Settings, User as UserIcon, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UserBanner = ({ compact = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const items = [
    {
      label: "View Profile",
      icon: UserIcon,
      onClick: () => navigate(`/profile/${user.username}`),
    },
    {
      label: "Messages",
      icon: Mail,
      onClick: () => navigate("/messages"),
    },
    {
      label: "Account Settings",
      icon: Settings,
      onClick: () => navigate("/settings"),
    },
  ];

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full p-0"
            aria-label="Account menu"
          >
            <UserAvatar className="h-9 w-9" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" side="top" align="start">
          <div className="flex flex-col gap-1">
            {items.map(({ label, icon: Icon, onClick }) => (
              <Button
                key={label}
                variant="ghost"
                className="w-full justify-start gap-2"
                size="sm"
                onClick={onClick}
              >
                <Icon size={16} />
                {label}
              </Button>
            ))}
            <div className="my-1 h-px bg-border" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              size="sm"
              onClick={logout}
            >
              <LogOut size={16} />
              Log Out
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-3">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar className="h-9 w-9" />
              <div className="flex min-w-0 flex-col items-start">
                <span className="truncate text-sm font-semibold leading-tight">
                  {user.first_name} {user.last_name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  @{user.username}
                </span>
              </div>
            </div>
            <MoreHorizontal size={18} className="shrink-0 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" side="top" align="start">
        <div className="flex flex-col gap-1">
          {items.map(({ label, icon: Icon, onClick }) => (
            <Button
              key={label}
              variant="ghost"
              className="w-full justify-start gap-2"
              size="sm"
              onClick={onClick}
            >
              <Icon size={16} />
              {label}
            </Button>
          ))}
          <div className={cn("my-1 h-px bg-border")} />
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            size="sm"
            onClick={logout}
          >
            <LogOut size={16} />
            Log Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
