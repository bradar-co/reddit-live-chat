"use client"

import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Settings } from "lucide-react"
import Comment, { RedditComment } from "@/components/comment";
import { useCommentFetcher } from "@/hooks/use-comment-fetcher";

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
      const initialComments = comments.slice(0, 10);
      setSeenComments(new Set(comments.map((comment) => comment.id)));
      setQueuedComments([...initialComments].reverse());
      setDisplayedComments([])
    } else if (comments.length > 0) {
      const newComments = comments.filter(
        comment => !seenComments.has(comment.id)
      );
      
      if (newComments.length > 0) {
        setSeenComments((prev) => {
          const updated = new Set(prev);
          newComments.forEach((comment) => updated.add(comment.id));
          return updated;
        });
        setQueuedComments((prev) => [...prev, ...newComments]);
      }
    }
  }, [comments]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (queuedComments.length > 0) {
      intervalId = setInterval(() => {
        setQueuedComments(prev => {
          if (prev.length === 0) return prev
          const [nextComment, ...remainingQueue] = prev
          setDisplayedComments(current => {
            if (!current.some(c => c.id === nextComment.id)) {
              return [nextComment, ...current]
            }
            return current
          })
          return remainingQueue
        })
      }, displayRate * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [queuedComments.length, displayRate]);

  useEffect(() => {
    setSeenComments(new Set());
    setQueuedComments([]);
    setDisplayedComments([]);
  }, [postUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPostUrl(url);
    setIsValidUrl(url.includes("reddit.com") && url.includes("/comments/"));
  };

  const handleStartFetching = () => {
    if (isValidUrl) {
      startFetching();
      setShowSettings(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="border-b">
        {isFetching && (
          <div className="fill-blue-600">
            <Progress value={progress} className="h-1 bg-gray-200" />
          </div>
        )}
        <div className="flex items-center justify-between p-4">
          <div className="flex-1 truncate font-medium">
            {postTitle ? postTitle : "Reddit Live Comments"}
            {queuedComments.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                ({queuedComments.length} in queue)
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {showSettings && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
              <div className="space-y-2">
                <label htmlFor="post-url" className="text-sm font-medium">
                  Reddit Post URL
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="post-url"
                    placeholder="https://www.reddit.com/r/subreddit/comments/..."
                    value={postUrl}
                    onChange={(e) => {
                      setPostUrl(e.target.value);
                      setIsValidUrl(
                        e.target.value.includes("reddit.com") &&
                          e.target.value.includes("/comments/")
                      );
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={isFetching ? stopFetching : handleStartFetching}
                    disabled={!isValidUrl && !isFetching}
                    variant={isFetching ? "destructive" : "default"}
                  >
                    {isFetching ? "Stop" : "Start"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="refresh-rate" className="text-sm font-medium">
                    Refresh Rate: {refreshRate} seconds
                  </label>
                </div>
                <Slider
                  id="refresh-rate"
                  min={1}
                  max={30}
                  step={1}
                  value={[refreshRate]}
                  onValueChange={(value) => setRefreshRate(value[0])}
                  disabled={isFetching}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="display-rate" className="text-sm font-medium">
                    Display Rate: {displayRate} seconds per comment
                  </label>
                </div>
                <Slider
                  id="display-rate"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={[displayRate]}
                  onValueChange={(value) => setDisplayRate(value[0])}
                  disabled={isFetching}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 text-red-500 bg-red-50 border-b text-sm">
            {error}
          </div>
        )}

        <div ref={commentsContainerRef} className="flex-1 overflow-y-auto">
          {displayedComments.length === 0 &&
          queuedComments.length === 0 &&
          !isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              {isFetching
                ? "Waiting for comments..."
                : "Enter a Reddit post URL and click Start"}
            </div>
          ) : (
            <div className="flex flex-col space-y-3 p-4 max-w-3xl mx-auto">
              {displayedComments.map((comment, index) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  isNew={index < 5}
                  newIndex={index}
                />
              ))}
            </div>
          )}

          {isLoading && comments.length === 0 && (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

