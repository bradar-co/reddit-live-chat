"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { RedditComment } from "@/components/comment"

// Map one Reddit comment node (`t1` data) to our shape, recursing into its
// replies so nested threads survive instead of being dropped.
function mapCommentNode(d: any): RedditComment {
  return {
    id: d.id,
    author: d.author || "[deleted]",
    body: d.body || "[removed]",
    score: d.score || 0,
    created: d.created_utc || Date.now() / 1000,
    permalink: d.permalink,
    replies: parseReplyListing(d.replies),
  }
}

// Reddit sets `replies` to "" when there are none, or to a Listing whose
// children hold the reply comments (plus "more" stubs we skip).
function parseReplyListing(replies: any): RedditComment[] {
  const children = replies?.data?.children
  if (!Array.isArray(children)) return []
  const out: RedditComment[] = []
  for (const child of children) {
    if (child?.kind === "t1" && child.data) {
      out.push(mapCommentNode(child.data))
    }
  }
  return out
}

export function useCommentFetcher(postUrl: string | null, interval: number = 30000) {
  const [comments, setComments] = useState<RedditComment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [title, setTitle] = useState<string>("")

  const commentIdsRef = useRef<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const parseRedditUrl = (url: string) => {
    try {
      // Extract the post ID and subreddit from the URL
      const match = url.match(/\/r\/([^/]+)\/comments\/([a-zA-Z0-9]+)/)
      if (!match) {
        // Try alternate format
        const altMatch = url.match(/\/comments\/([a-zA-Z0-9]+)/)
        if (!altMatch) throw new Error("Invalid Reddit URL")

        return {
          subreddit: null,
          postId: altMatch[1],
        }
      }

      return {
        subreddit: match[1],
        postId: match[2],
      }
    } catch (err) {
      throw new Error("Could not parse Reddit URL")
    }
  }

  const fetchComments = useCallback(async () => {
    if (!postUrl) return

    try {
      setIsLoading(true)
      setError(null)

      const { postId, subreddit } = parseRedditUrl(postUrl)

      // Use Reddit's JSONP API with a callback parameter
      // This creates a script element to bypass CORS
      return new Promise<void>((resolve, reject) => {
        const callbackName = `redditJsonpCallback_${Date.now()}`
        const globalScope = window as any

        // Create global callback function
        globalScope[callbackName] = (data: any) => {
          try {
            // Extract post title if available
            if (data[0]?.data?.children?.[0]?.data?.title) {
              setTitle(data[0].data.children[0].data.title)
            }

            // Process the data
            if (!data[1]?.data?.children) {
              throw new Error("Invalid response format from Reddit")
            }

            const newComments: RedditComment[] = []

            // Process comments. Dedup is by top-level comment id; each new one
            // carries its full (already-fetched) reply tree along with it.
            data[1].data.children.forEach((child: any) => {
              if (child.kind === "t1" && child.data) {
                const commentData = child.data
                const commentId = commentData.id

                // Only add comments we haven't seen before
                if (!commentIdsRef.current.has(commentId)) {
                  commentIdsRef.current.add(commentId)

                  newComments.push({
                    ...mapCommentNode(commentData),
                    isNew: true, // Mark new comments
                  })
                }
              }
            })

            // Add new comments to the beginning of the array
            if (newComments.length > 0) {
              setComments((prev) => {
                const combined = [...newComments, ...prev.map(c => ({ ...c, isNew: false }))]
                return combined.slice(0, 100)
              })
            }

            // Clean up
            document.body.removeChild(script)
            delete globalScope[callbackName]

            setIsLoading(false)
            resolve()
          } catch (err: any) {
            setError(err.message || "Failed to process comments")
            setIsLoading(false)
            reject(err)
          }
        }

        // Create script element
        // Use old.reddit.com: www.reddit.com is behind a WAF that no longer serves
        // the JSONP-wrapped response (it returns a block page, tripping script.onerror).
        // old.reddit.com still honors ?jsonp= and returns executable callback(...) JS.
        const script = document.createElement("script")
        script.src = `https://old.reddit.com/comments/${postId}.json?limit=100&sort=new&raw_json=1&jsonp=${callbackName}`
        script.onerror = () => {
          document.body.removeChild(script)
          delete globalScope[callbackName]
          setError("Failed to fetch comments from Reddit")
          setIsLoading(false)
          reject(new Error("Script load error"))
        }

        // Add script to document
        document.body.appendChild(script)
      })
    } catch (err: any) {
      setError(err.message || "Failed to fetch comments")
      setIsLoading(false)
    }
  }, [postUrl])

  const startFetching = useCallback(() => {
    if (isFetching) return

    setIsFetching(true)
    setComments([])
    commentIdsRef.current.clear()

    // Initial fetch
    fetchComments()

    // Set up interval using seconds converted to milliseconds
    const intervalTime = interval * 1000 // Convert seconds to milliseconds
    intervalRef.current = setInterval(fetchComments, intervalTime)

  }, [fetchComments, interval, isFetching])

  const stopFetching = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsFetching(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    comments,
    isLoading,
    error,
    startFetching,
    stopFetching,
    isFetching,
    title,
  }
}

