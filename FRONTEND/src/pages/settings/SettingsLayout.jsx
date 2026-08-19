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
    <main className="mx-auto max-w-xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => navigate(`/settings/${val}`)}>
        <TabsList className="w-full">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex-1 gap-1.5">
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tab content */}
      <Outlet />
    </main>
  );
}
