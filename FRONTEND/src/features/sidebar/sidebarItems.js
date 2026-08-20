import { Bell, Home, Mail, Settings, User, Users } from "lucide-react";

export const sidebarItems = {
  links: [
    { label: "Home", href: "/home", icon: Home },
    { label: "Friends", href: "/friends", icon: Users },
    { label: "Messages", href: "/messages", icon: Mail, countKey: "messages" },
    { label: "Notifications", href: "/notifications", icon: Bell, countKey: "notifications" },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};
