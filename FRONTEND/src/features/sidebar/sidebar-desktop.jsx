import { NavLink } from "react-router-dom";
import { UserBanner } from "./UserBanner";
import { ThemeToggle } from "@/components/theme-toggle";

export function SidebarDesktop({ sidebarItems }) {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[270px] max-w-xs flex-col border-r border-border bg-background">
      <div className="flex-1 px-3 py-4">
        <div className="flex items-center justify-between px-3">
          <h3 className="text-lg font-semibold text-foreground">Project-X</h3>
          <ThemeToggle />
        </div>
        <nav className="mt-5 flex flex-col gap-1">
          {sidebarItems.links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`
              }
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="border-t border-border p-3">
        <UserBanner />
      </div>
    </aside>
  );
}
