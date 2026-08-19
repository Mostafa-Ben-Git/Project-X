import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { UserBanner } from "./UserBanner";
import { Badge } from "@/components/ui/badge";

export function SidebarMobile({ sidebarItems, counts }) {
  const badgeFor = (link) =>
    link.countKey ? (counts?.[link.countKey] ?? 0) : 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="fixed left-2 top-2 z-[9]">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] px-3 py-4" hideClose>
        <SheetHeader className="flex flex-row items-center justify-between space-y-0">
          <span className="mx-3 text-lg font-semibold text-foreground">
            Project-X
          </span>
          <SheetClose asChild>
            <Button className="h-7 w-7 p-0" variant="ghost" size="icon">
              <X size={15} />
            </Button>
          </SheetClose>
        </SheetHeader>
        <nav className="mt-5 flex flex-col gap-1">
          {sidebarItems.links.map((link) => {
            const count = badgeFor(link);
            return (
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
                <span className="flex-1">{link.label}</span>
                {count > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 justify-center rounded-full px-1.5">
                    {count > 99 ? "99+" : count}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-0 w-full px-3">
          <UserBanner />
        </div>
      </SheetContent>
    </Sheet>
  );
}
