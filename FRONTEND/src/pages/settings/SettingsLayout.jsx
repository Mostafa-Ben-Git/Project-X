import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Shield, Globe } from "lucide-react";

const TABS = [
  { value: "profile", label: "Profile", icon: User, path: "/settings/profile" },
  { value: "password", label: "Password", icon: Lock, path: "/settings/password" },
  { value: "privacy", label: "Privacy", icon: Shield, path: "/settings/privacy" },
  { value: "account", label: "Account", icon: Globe, path: "/settings/account" },
];

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split("/settings/")[1] || "profile";

  return (
    <main className="mx-auto max-w-xl space-y-4 p-3 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:space-y-6 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      {/* Tabs - scrollable on mobile, labels always visible */}
      <Tabs value={activeTab} onValueChange={(val) => navigate(`/settings/${val}`)}>
        <TabsList className="w-full justify-start gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-1 sm:justify-center">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="min-h-[36px] flex-1 gap-1.5 whitespace-nowrap px-2 text-xs sm:px-3 sm:text-sm">
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tab content */}
      <Outlet />
    </main>
  );
}
