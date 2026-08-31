import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { UserBanner } from "./UserBanner";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BellIcon,
  Home,
  MessageSquare,
  UserCircle,
  UsersRound,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";

export default function LeftBar({ className }) {
  const { isLoading } = useSelector((store) => store.auth);

  return (
    <aside className={className}>
      <nav className="flex h-full flex-col border-r border-border shadow-sm">
        <div className="flex items-center justify-between p-4 pb-2">
          <Logo size={30} wordmarkSize="default" />
          <ThemeToggle />
        </div>
        <ul className="mt-3 flex-1 px-3 py-2">
          <SidebarItem icon={<Home size={24} />} to="/home" text="home" />
          <SidebarItem
            icon={<MessageSquare size={24} />}
            to="/messages"
            text="messages"
          />
          <SidebarItem
            icon={<BellIcon size={24} />}
            to="/notifications"
            text="notifications"
          />
          <SidebarItem
            icon={<UsersRound size={24} />}
            to="/friends"
            text="friends"
          />
          <SidebarItem
            icon={<UserCircle size={24} />}
            to="/profile"
            text="profile"
          />
        </ul>
        <div className="border-t border-border">
          {isLoading ? <LoadingSkeleton /> : <UserBanner />}
        </div>
      </nav>
    </aside>
  );
}

const LoadingSkeleton = () => (
  <div className="flex items-center space-x-3 px-4 py-3">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[140px]" />
      <Skeleton className="h-3 w-[100px]" />
    </div>
  </div>
);

export function SidebarItem({ icon, text, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `my-1 flex cursor-pointer items-center rounded-xl px-3 py-2 font-medium transition-colors ${
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
        }`
      }
    >
      {icon}
      <span className="ml-4 text-lg">{text}</span>
    </NavLink>
  );
}
