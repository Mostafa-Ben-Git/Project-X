import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { changePassword } from "@/api/users";
import { useState } from "react";

export default function PasswordTab() {
  const [pwdLoading, setPwdLoading] = useState(false);

  const handlePassword = async (e) => {
    e.preventDefault();
    const form = e.target;
    const current = form.current_password.value;
    const newPwd = form.new_password.value;
    const confirm = form.confirm_password.value;
    if (!current || !newPwd) return toast.error("Fill all fields");
    if (newPwd.length < 8) return toast.error("Password must be at least 8 characters");
    if (newPwd !== confirm) return toast.error("Passwords don't match");
    setPwdLoading(true);
    try {
      await changePassword({ current_password: current, new_password: newPwd, new_password_confirmation: confirm });
      toast.success("Password updated");
      form.reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Change password</CardTitle>
        <CardDescription>Must be at least 8 characters</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current_password">Current password</Label>
            <Input id="current_password" type="password" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password">New password</Label>
            <Input id="new_password" type="password" required minLength={8} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <Input id="confirm_password" type="password" required minLength={8} />
          </div>
          <Button type="submit" disabled={pwdLoading}>
            {pwdLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
