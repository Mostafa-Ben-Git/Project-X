import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function SidebarMobile({ sidebarItems, counts }) {
  const badgeFor = (link) =>
    link.countKey ? (counts?.[link.countKey] ?? 0) : 0;

  const mobileLinks = sidebarItems.links.filter(
    (link) => !["Settings"].includes(link.label)
  );

  return (
    <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-border bg-background px-2 py-2 md:hidden">
      {mobileLinks.map((link) => {
        const count = badgeFor(link);
        return (
          <NavLink
            key={link.href}
            to={link.href}
            className={({ isActive }) =>
              `relative flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
              }`
            }
          >
            <link.icon className="h-6 w-6" />
            {count > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-0.5 -top-0.5 h-5 min-w-5 justify-center rounded-full px-1"
              >
                {count > 99 ? "99+" : count}
              </Badge>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
