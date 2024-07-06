import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function SidebarButton({ icon: Icon, className, children, ...props}) {



  return (
    <Button
      variant="ghost"
      className={cn("justify-start gap-2", className)}
      {...props}
    >
      {Icon && <Icon size={30} />}
      <span className="text-lg ">{children}</span>
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
