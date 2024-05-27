import { cn } from "@/lib/utils";
import { EyeOff, LucideEye } from "lucide-react";
import { useState } from "react";

function InputPassWord({ ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        {...props}
        className={cn("w-full", props.className)}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-1/2 translate-y-[-40%]"
      >
        {showPassword ? (
          <LucideEye size={24} />
        ) : (
          <EyeOff size={24} className="text-muted" />
        )}
      </button>
    </div>
  );
}
export default InputPassWord;
