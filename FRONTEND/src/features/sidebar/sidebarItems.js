import { Bell, Bookmark, Home, Mail, Settings, User, Users } from "lucide-react";

export const sidebarItems = {
  links: [
    { label: "Home", href: "/home", icon: Home },
    { label: "Friends", href: "/friends", icon: Users },
    { label: "Messages", href: "/messages", icon: Mail, countKey: "messages" },
    { label: "Notifications", href: "/notifications", icon: Bell, countKey: "notifications" },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};
