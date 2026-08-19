import { useMediaQuery } from "@uidotdev/usehooks";
import {
  Bell,
  Home,
  Mail,
  Settings,
  User,
  Users,
} from "lucide-react";
import { SidebarDesktop } from "./sidebar-desktop";
import { SidebarMobile } from "./sidebar-mobile";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";

const sidebarItems = {
  links: [
    { label: "Home", href: "/home", icon: Home },
    { label: "Friends", href: "/friends", icon: Users },
    { label: "Messages", href: "/messages", icon: Mail, countKey: "messages" },
    { label: "Notifications", href: "/notifications", icon: Bell, countKey: "notifications" },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};

export function Sidebar() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const counts = useUnreadCounts();

  if (isDesktop) {
    return <SidebarDesktop sidebarItems={sidebarItems} counts={counts} />;
  }

  return <SidebarMobile sidebarItems={sidebarItems} counts={counts} />;
}
