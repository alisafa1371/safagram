"use client";
import { prisma } from "@/lib/prisma";
import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";

function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);

    try {
      await toggleFollow(userId);
      toast.success("User followed successfully");
    } catch (error) {
      console.log("Error Following user ", error);
      toast.error("Error Following user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      variant="secondary"
      size="sm"
      className="w-20"
      disabled={isLoading}
    >
      {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
    </Button>
  );
}

export default FollowButton;
