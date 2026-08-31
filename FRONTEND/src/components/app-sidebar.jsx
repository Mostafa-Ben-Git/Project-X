import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserBanner } from "@/features/sidebar/UserBanner";
import { sidebarItems } from "@/features/sidebar/sidebarItems";
import { LogoIcon, LogoWordmark } from "@/components/logo";

function SidebarNavItem({ item, count }) {
  const { pathname } = useLocation();
  const isActive =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <NavLink to={item.href} end={item.href === "/"}>
          <item.icon className="h-5 w-5 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {item.label}
          </span>
        </NavLink>
      </SidebarMenuButton>
      {count > 0 && (
        <SidebarMenuBadge className="border-0 bg-destructive text-destructive-foreground text-[10px]">
          <span>{count > 99 ? "99+" : count}</span>
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { messages, notifications } = useUnreadCounts();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const countFor = (item) =>
    item.countKey === "messages"
      ? messages
      : item.countKey === "notifications"
        ? notifications
        : 0;

    return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavLink
          to="/home"
          className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          aria-label="Home"
        >
          <LogoIcon size={32} variant="sidebar" className="h-8 w-8 shrink-0" />
          <LogoWordmark size="default" className="group-data-[collapsible=icon]:hidden" />
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {sidebarItems.links.map((item) => (
              <SidebarNavItem key={item.href} item={item} count={countFor(item)} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle />
            <UserBanner compact />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <UserBanner compact={false} />
            <ThemeToggle />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
