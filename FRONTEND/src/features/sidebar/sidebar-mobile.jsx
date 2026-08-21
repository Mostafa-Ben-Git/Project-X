import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function SidebarMobile({ sidebarItems, counts }) {
  const badgeFor = (link) => (link.countKey ? (counts?.[link.countKey] ?? 0) : 0);

  // Show all primary links on mobile — Settings included so logout is reachable via /settings -> Account
  const mobileLinks = sidebarItems.links;

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-border bg-background/95 px-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      {mobileLinks.map((link) => {
        const count = badgeFor(link);
        return (
          <NavLink
            key={link.href}
            to={link.href}
            aria-label={link.label}
            className={({ isActive }) =>
              `relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-150 active:scale-90 ${
                isActive ? "bg-accent text-primary" : "text-foreground/70 hover:text-primary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 2} />
                {count > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute right-0.5 top-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] leading-none ring-2 ring-background"
                  >
                    {count > 99 ? "99+" : count}
                  </Badge>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}