import LoaderCircle from "@/components/LoaderCircle";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";
import { useMediaQuery } from "@uidotdev/usehooks";
import { LogOut, MoreHorizontal, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarButton } from "./sidebar-button";

const UserInfo = ({ user }) => (
  <div className="flex gap-2">
    <div className="flex flex-col items-center justify-center lg:items-baseline">
      <p className="whitespace-nowrap text-lg font-extrabold">{`${user?.first_name} ${user?.last_name}`}</p>
      <span className="text-sm text-gray-400">{user?.username}</span>
    </div>
  </div>
);

const UserBannerLinks = ({ isLoggedOut, logout }) => {
  if (isLoggedOut) {
    <LoaderCircle size={24} className="mx-auto" />;
  }
  return (
    <div className="space-y-1">
      <Link to="/">
        <SidebarButton size="sm" icon={Settings} className="w-full">
          Account Settings
        </SidebarButton>
      </Link>
      <SidebarButton
        size="sm"
        icon={LogOut}
        className="w-full"
        onClick={logout}
      >
        Log Out
      </SidebarButton>
    </div>
  );
};

export const UserBanner = () => {
  const { user, logout, isLoggedOut } = useAuth();

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!user) {
    return null; // Handle the case where user data is not available
  }

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="w-full justify-start">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <UserAvatar className="h-8 w-8" />
                <span>
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
              <MoreHorizontal size={20} />
            </div>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="mb-2 p-2">
          <UserBannerLinks isLoggedOut={isLoggedOut} logout={logout} />
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <div className="absolute bottom-3 left-0 w-full cursor-pointer px-3">
      <Separator className="absolute -top-3 left-0 w-full" />
      <Popover>
        <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <UserAvatar className="h-8 w-8" />
                <span>
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
              <MoreHorizontal size={20} />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2">
          <UserBannerLinks isLoggedOut={isLoggedOut} logout={logout} />
        </PopoverContent>
      </Popover>
    </div>
  );
};
