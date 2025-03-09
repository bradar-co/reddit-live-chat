"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  created: number;
  permalink?: string;
  avatar?: string;
  isNew?: boolean;
}

interface CommentProps {
  comment: RedditComment;
  isNew?: boolean;
  newIndex?: number;
}

export default function Comment({
  comment,
  isNew = false,
  newIndex = 0,
}: CommentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Use specific Tailwind blue classes that we know exist
  const getHighlightColor = () => {
    if (!isNew) return "border-l-zinc-200";
    switch (newIndex) {
      case 0:
        return "border-l-zinc-600";
      case 1:
        return "border-l-zinc-500";
      case 2:
        return "border-l-zinc-400";
      case 3:
        return "border-l-zinc-400";
      case 4:
        return "border-l-zinc-300";
      default:
        return "border-l-stone-200";
    }
  };

  const getbgColor = () => {
    if (!isNew) return "bg-stone-50";
    switch (newIndex) {
      case 0:
        return "bg-stone-300";
      case 1:
        return "bg-stone-200";
      case 2:
        return "bg-stone-100";
      case 3:
        return "bg-stone-100";
      case 4:
        return "bg-stone-100";
      default:
        return "bg-stone-100";
    }
  };

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-in-out",
        visible
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform -translate-y-4"
      )}
    >
      <Card
        className={cn(
          "border-l-4 hover:border-l-zinc-600",
          getHighlightColor()
        )}
      >
        <CardContent className={cn("p-3 hover:bg-stone-400", getbgColor())}>
          <div className="flex items-start space-x-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className="font-medium truncate">{comment.author}</div>
                <div className="text-xs text-gray-600">
                  {timeAgo(comment.created)}
                </div>
              </div>
              <div className="text-sm break-words">{comment.body}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
