"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, MessageSquareText } from "lucide-react";
import Comment, { RedditComment } from "@/components/comment";
import { useCommentFetcher } from "@/hooks/use-comment-fetcher";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RedditLiveComments() {
  const [postUrl, setPostUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [refreshRate, setRefreshRate] = useState(5); // seconds
  const [showSettings, setShowSettings] = useState(true);
  const [postTitle, setPostTitle] = useState("");
  const [progress, setProgress] = useState(100);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const [displayRate, setDisplayRate] = useState(1); // seconds per comment
  const [displayedComments, setDisplayedComments] = useState<RedditComment[]>([])
  const [queuedComments, setQueuedComments] = useState<RedditComment[]>([])
  const [seenComments, setSeenComments] = useState<Set<string>>(new Set())
  const [effectiveDisplayRate, setEffectiveDisplayRate] = useState(displayRate);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const {
    comments,
    isLoading,
    error,
    startFetching,
    stopFetching,
    isFetching,
    title,
  } = useCommentFetcher(postUrl, refreshRate);

  useEffect(() => {
    if (title) {
      setPostTitle(title);
    }
  }, [title]);

  useEffect(() => {
    if (commentsContainerRef.current && comments.length > 0) {
      commentsContainerRef.current.scrollTop = 0;
    }
  }, [comments]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isFetching) {
      const startTime = Date.now();
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = refreshRate * 1000 - (elapsed % (refreshRate * 1000));
        setProgress((remaining / (refreshRate * 1000)) * 100);
      };

      intervalId = setInterval(updateProgress, 100);
      updateProgress();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isFetching, refreshRate]);

  useEffect(() => {
    if (comments.length > 0 && seenComments.size === 0) {
      // Initial load of 10 comments
      const initialComments = comments.slice(0, 30);
      setSeenComments(new Set(comments.map((comment) => comment.id)));
      setQueuedComments([...initialComments].reverse());
      setDisplayedComments([]);
    } else if (comments.length > 0) {
      const newComments = comments.filter(
        (comment) => !seenComments.has(comment.id)
      );

      if (newComments.length > 0) {
        setSeenComments((prev) => {
          const updated = new Set(prev);
          newComments.forEach((comment) => updated.add(comment.id));
          return updated;
        });

        setQueuedComments((prev) => {
          const maxQueueSize = Math.floor(refreshRate / displayRate) * 5;
          const newQueue = [...prev, ...newComments.reverse()]; // Reverse new comments to maintain chronological order
          const slicedQueue = newQueue.slice(-maxQueueSize);
          return slicedQueue;
        });
      }
    }
  }, [comments, refreshRate, displayRate]);

  useEffect(() => {
    if (queuedComments.length > 0) {
      // Dynamically adjust display rate based on queue size
      const maxQueueSize = Math.floor(refreshRate / displayRate) * 5;
      const queuePercentage = queuedComments.length / maxQueueSize;

      // Speed up display rate if queue is more than 50% full
      if (queuePercentage > 0.5) {
        const newRate = Math.max(
          0.2,
          displayRate * (1 - queuePercentage * 0.8)
        );
        setEffectiveDisplayRate(newRate);
      } else {
        setEffectiveDisplayRate(displayRate);
      }
    }
  }, [queuedComments.length, refreshRate, displayRate]);

  // Update the comment display interval to use effectiveDisplayRate
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (queuedComments.length > 0) {
      intervalId = setInterval(() => {
        setQueuedComments((prev) => {
          if (prev.length === 0) return prev;
          const [nextComment, ...remainingQueue] = prev;
          setDisplayedComments((current) => {
            if (!current.some((c) => c.id === nextComment.id)) {
              return [nextComment, ...current];
            }
            return current;
          });
          return remainingQueue;
        });
      }, effectiveDisplayRate * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [queuedComments.length, effectiveDisplayRate]);

  useEffect(() => {
    setSeenComments(new Set());
    setQueuedComments([]);
    setDisplayedComments([]);
    setExpandedIds(new Set());
  }, [postUrl]);

  const validateUrl = (url: string) =>
    url.includes("reddit.com") && url.includes("/comments/");

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPostUrl(url);
    setIsValidUrl(validateUrl(url));
  };

  const handleStartFetching = () => {
    if (isValidUrl) {
      startFetching();
      setShowSettings(false);
    }
  };

  const hasFeed = displayedComments.length > 0 || queuedComments.length > 0;

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        {/* Refresh countdown line */}
        <div className="h-0.5 w-full bg-transparent">
          {isFetching && (
            <div
              className="h-full bg-brand transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>

        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {isFetching ? (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-live-pulse" />
                Live
              </span>
            ) : (
              <MessageSquareText className="h-5 w-5 shrink-0 text-brand" />
            )}

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold leading-tight text-foreground">
                {postTitle || "Reddit Live Comments"}
              </h1>
              {isFetching && (
                <p className="truncate text-xs text-muted-foreground">
                  {displayedComments.length.toLocaleString()} shown
                  {queuedComments.length > 0 && (
                    <> · {queuedComments.length} incoming</>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <Button
              variant={showSettings ? "secondary" : "ghost"}
              size="icon"
              aria-label="Settings"
              aria-pressed={showSettings}
              onClick={() => setShowSettings((s) => !s)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings */}
      {showSettings && (
        <div className="border-b border-border bg-muted/40">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-4">
            <div className="space-y-1.5">
              <label htmlFor="post-url" className="text-xs font-medium text-muted-foreground">
                Reddit post URL
              </label>
              <div className="flex gap-2">
                <Input
                  id="post-url"
                  placeholder="https://reddit.com/r/…/comments/…"
                  value={postUrl}
                  onChange={handleUrlChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValidUrl && !isFetching) {
                      handleStartFetching();
                    }
                  }}
                  className="flex-1 bg-background"
                />
                <Button
                  onClick={isFetching ? stopFetching : handleStartFetching}
                  disabled={!isValidUrl && !isFetching}
                  variant={isFetching ? "destructive" : "default"}
                  className={
                    isFetching
                      ? undefined
                      : "bg-brand text-brand-foreground hover:bg-brand/90"
                  }
                >
                  {isFetching ? "Stop" : "Start"}
                </Button>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label htmlFor="refresh-rate" className="text-xs font-medium text-muted-foreground">
                    Refresh rate
                  </label>
                  <span className="text-xs tabular-nums text-foreground">
                    {refreshRate}s
                  </span>
                </div>
                <Slider
                  id="refresh-rate"
                  min={1}
                  max={60}
                  step={1}
                  value={[refreshRate]}
                  onValueChange={(value) => setRefreshRate(value[0])}
                  disabled={isFetching}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label htmlFor="display-rate" className="text-xs font-medium text-muted-foreground">
                    Display pace
                  </label>
                  <span className="text-xs tabular-nums text-foreground">
                    {displayRate}s / comment
                  </span>
                </div>
                <Slider
                  id="display-rate"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={[displayRate]}
                  onValueChange={(value) => setDisplayRate(value[0])}
                  disabled={isFetching}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-auto w-full max-w-2xl px-4 pt-3">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        </div>
      )}

      {/* Feed */}
      <div
        ref={commentsContainerRef}
        className="thin-scroll flex-1 overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-2xl px-2 py-3 sm:px-4">
          {!hasFeed && !isLoading ? (
            <EmptyState isFetching={isFetching} />
          ) : (
            <div className="flex flex-col gap-0.5">
              {displayedComments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  expandedIds={expandedIds}
                  onToggle={toggleExpanded}
                />
              ))}
            </div>
          )}

          {isLoading && !hasFeed && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <p className="text-sm">Loading comments…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ isFetching }: { isFetching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
        <MessageSquareText className="h-6 w-6 text-brand" />
      </div>
      {isFetching ? (
        <>
          <p className="text-sm font-medium text-foreground">Waiting for comments…</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            New reactions will stream in here as they&apos;re posted.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">Watch a thread go live</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Paste a Reddit post URL above and press Start to stream its comments
            in real time.
          </p>
        </>
      )}
    </div>
  );
}
