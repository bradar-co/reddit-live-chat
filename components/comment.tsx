"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface RedditComment {
  id: string
  author: string
  body: string
  score: number
  created: number
  permalink?: string
  avatar?: string
  isNew?: boolean
}

interface CommentProps {
  comment: RedditComment
  isNew?: boolean
}

export default function Comment({ comment, isNew = false }: CommentProps) {
  const [visible, setVisible] = useState(!isNew)

  useEffect(() => {
    if (isNew || comment.isNew) {
      const timer = setTimeout(() => {
        setVisible(true)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isNew, comment.isNew])

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)

    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-in-out",
        (isNew || comment.isNew) && !visible ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0",
      )}
    >
      <Card className={cn(
        "border-l-4",
        (isNew || comment.isNew) ? "border-l-blue-400" : "border-l-gray-200"
      )}>
        <CardContent className="p-3">
          <div className="flex items-start space-x-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className="font-medium truncate">{comment.author}</div>
                <div className="text-xs text-gray-500">{timeAgo(comment.created)}</div>
              </div>
              <div className="text-sm break-words">{comment.body}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

