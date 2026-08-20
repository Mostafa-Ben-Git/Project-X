import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PrivacyTab() {
  const { user, updateUserData } = useAuth();

  const handleToggle = async (field, value) => {
    try {
      const formData = new FormData();
      formData.append(field, value ? "1" : "0");
      await updateUserData(formData);
      toast.success("Updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleSelect = async (field, value) => {
    try {
      const formData = new FormData();
      formData.append(field, value);
      await updateUserData(formData);
      toast.success("Updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Privacy</CardTitle>
          <CardDescription>Control who can see your content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Private account</Label>
              <p className="text-sm text-muted-foreground">Only followers can see your posts</p>
            </div>
            <Switch
              checked={user.is_private}
              onCheckedChange={(val) => handleToggle("is_private", val)}
            />
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label>Show online status</Label>
            <p className="text-sm text-muted-foreground">Others can see when you&apos;re active</p>
            <Select
              defaultValue={user.status || "online"}
              onValueChange={(val) => handleSelect("status", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">🟢 Online</SelectItem>
                <SelectItem value="away">🟡 Away</SelectItem>
                <SelectItem value="offline">⚫ Offline</SelectItem>
                <SelectItem value="dnd">🔴 Do not disturb</SelectItem>
                <SelectItem value="hidden">👻 Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select
              defaultValue={user.language || "en"}
              onValueChange={(val) => handleSelect("language", val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
