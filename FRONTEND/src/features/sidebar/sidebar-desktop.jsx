import { NavLink } from "react-router-dom";
import { UserBanner } from "./UserBanner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SidebarDesktop({ sidebarItems, counts }) {
  const badgeFor = (link) =>
    link.countKey ? (counts?.[link.countKey] ?? 0) : 0;

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[70px] flex-col border-r border-border bg-background">
        <div className="flex flex-1 flex-col items-center px-2 py-4">
          <span className="py-2 text-xl font-bold text-foreground">X</span>
          <nav className="mt-3 flex w-full flex-col items-center gap-2">
            {sidebarItems.links.map((link) => {
              const count = badgeFor(link);
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={link.href}
                      className={({ isActive }) =>
                        `relative flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`
                      }
                    >
                      <link.icon className="h-6 w-6" />
                      {count > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1"
                        >
                          {count > 99 ? "99+" : count}
                        </Badge>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </div>
        <div className="flex justify-center border-t border-border p-2">
          <ThemeToggle />
        </div>
        <div className="flex justify-center p-2">
          <UserBanner compact />
        </div>
      </aside>
    </TooltipProvider>
  );
}
