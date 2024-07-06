import { Link, useLocation } from "react-router-dom";
import { UserBanner } from "./UserBanner";
import { SidebarButton } from "./sidebar-button";

export function SidebarDesktop(props) {
  const pathname = useLocation().pathname;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[270px] max-w-xs border-r">
      <div className="h-full px-3 py-4">
        <h3 className="mx-3 text-lg font-semibold text-foreground">
          Project-X
        </h3>
        <div className="mt-5">
          <div className="flex w-full flex-col gap-1">
            {props.sidebarItems.links.map((link, index) => (
              <Link key={index} to={link.href}>
                <SidebarButton
                  variant={pathname === link.href ? "secondary" : "ghost"}
                  icon={link.icon}
                  className="max-w-max"
                >
                  {link.label}
                </SidebarButton>
              </Link>
            ))}
            {props.sidebarItems.extras}
          </div>
          <UserBanner />
        </div>
      </div>
    </aside>
  );
}
