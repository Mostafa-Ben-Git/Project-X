import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function SidebarButton({ icon: Icon, className, children, ...props }) {
  return (
    <Button
      variant="ghost"
      className={cn("h-11 justify-start gap-3 text-[15px]", className)}
      {...props}
    >
      {Icon && <Icon size={22} />}
      <span>{children}</span>
    </Button>
  );
}

export function SidebarButtonSheet(props) {
  return (
    <SheetClose asChild>
      <SidebarButton {...props} />
    </SheetClose>
  );
}