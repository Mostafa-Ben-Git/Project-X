import { useMediaQuery } from "@uidotdev/usehooks";
import {
  Bell,
  Home,
  Mail,
  User,
  Users,
} from "lucide-react";
import { SidebarDesktop } from "./sidebar-desktop";
import { SidebarMobile } from "./sidebar-mobile";

const sidebarItems = {
  links: [
    { label: "Home", href: "/home", icon: Home },
    { label: "Friends", href: "/friends", icon: Users },
    { label: "Messages", href: "/messages", icon: Mail },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Profile", href: "/profile", icon: User },
  ],
};

export function Sidebar() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return <SidebarDesktop sidebarItems={sidebarItems} />;
  }

  return <SidebarMobile sidebarItems={sidebarItems} />;
}
