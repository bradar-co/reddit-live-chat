"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  created: number;
  isNew?: boolean;
  replies?: RedditComment[];
}

interface CommentProps {
  comment: RedditComment;
  depth?: number;
  // Expansion state is lifted to the page so it survives the live feed's
  // constant re-renders — otherwise an open thread snaps shut on each update.
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
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

// Total number of responses under a comment, counting every nesting level.
const countReplies = (replies?: RedditComment[]): number =>
  replies?.reduce((total, reply) => total + 1 + countReplies(reply.replies), 0) ??
  0;

export default function Comment({
  comment,
  depth = 0,
  expandedIds,
  onToggle,
}: CommentProps) {
  const deleted = comment.author === "[deleted]";
  const isRoot = depth === 0;
  const replyCount = countReplies(comment.replies);
  const hasReplies = replyCount > 0;
  const expanded = expandedIds.has(comment.id);

  return (
    <div className="group">
      <div
        className={cn(
          "flex gap-3 rounded-lg px-2 py-2",
          // Only top-level comments stream in — replies are revealed on expand.
          isRoot && "animate-comment-in animate-highlight-fade"
        )}
      >
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

          {hasReplies && (
            <button
              type="button"
              onClick={() => onToggle(comment.id)}
              aria-expanded={expanded}
              className="mt-1 -ml-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight
                aria-hidden
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  expanded && "rotate-90"
                )}
              />
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {hasReplies && expanded && (
        <div className="ml-5 space-y-0.5 border-l border-border pl-1.5 sm:ml-6">
          {comment.replies!.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
