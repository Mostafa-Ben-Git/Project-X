import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useAuth from "@/hooks/useAuth";
import { LogOut, MoreHorizontal, Settings } from "lucide-react";

export const UserBanner = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar className="h-9 w-9" />
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold leading-tight">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  @{user.username}
                </span>
              </div>
            </div>
            <MoreHorizontal size={18} className="text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" side="top" align="start">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            size="sm"
          >
            <Settings size={16} />
            Account Settings
          </Button>
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
