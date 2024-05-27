"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { useState } from "react";
import { AlertDeleteDialog } from "./AlertDeleteDialog";

export function DropDownActions({
  post_id,
  user_id,
  open,
  setShowDropDown,
  showPanelDelete,
  setShowPanelDelete,
}) {
  return (
    <DropdownMenu className="w-56" open={open}>
      <Button
        variant="outline"
        onClick={() => setShowDropDown((state) => !state)}
      >
        <Settings />
      </Button>
      <DropdownMenuContent className="flex flex-col gap-2 p-2">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <AlertDeleteDialog
          post_id={post_id}
          open={showPanelDelete}
          setShowDropDown={setShowDropDown}
        >
          <Button variant="outline" onClick={() => setShowPanelDelete(true)}>
            Delete Post
          </Button>
        </AlertDeleteDialog>
        <Button variant="outline">Edit Post</Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
