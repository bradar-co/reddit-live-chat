"use client";

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
}

const timeAgo = (timestamp: number) => {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};

const getInitials = (name: string) =>
  name.replace(/^u\//, "").slice(0, 2).toUpperCase();

export default function Comment({ comment }: CommentProps) {
  const deleted = comment.author === "[deleted]";

  return (
    <div className="group flex gap-3 rounded-lg px-2 py-2 animate-comment-in animate-highlight-fade">

      <div
        aria-hidden
        className="mt-0.5 flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground/80"
      >
        {deleted ? "—" : getInitials(comment.author)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "truncate text-sm font-semibold",
              deleted ? "text-muted-foreground italic" : "text-foreground"
            )}
          >
            {deleted ? "[deleted]" : comment.author}
          </span>
          <time className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {timeAgo(comment.created)}
          </time>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90 [overflow-wrap:anywhere]">
          {comment.body}
        </p>
      </div>
    </div>
  );
}
