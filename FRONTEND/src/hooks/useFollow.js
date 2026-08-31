import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleFollow } from "@/api/users";

export function useFollow() {
  const qc = useQueryClient();

  const followMutation = useMutation({
    mutationFn: toggleFollow,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["suggestions"] });
      toast.success(data?.user === "followed" ? "Following" : "Unfollowed");
    },
    onError: () => toast.error("Could not update follow status"),
  });

  const handleFollow = (userId) => followMutation.mutateAsync(userId);

  return {
    handleFollow,
    isPending: followMutation.isPending,
  };
}
