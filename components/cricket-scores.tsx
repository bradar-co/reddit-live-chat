import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { useCricketScores } from "@/hooks/use-cricket-scores"
import { useState, useEffect } from "react"

export default function CricketScores() {
  const { matches, isLoading, error, lastFetched } = useCricketScores()
  const [timeAgo, setTimeAgo] = useState("")

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastFetched) return
      
      const seconds = Math.floor((Date.now() - lastFetched) / 1000)
      setTimeAgo(`${seconds} seconds ago`)
    }

    const timer = setInterval(updateTimeAgo, 1000)
    updateTimeAgo()

    return () => clearInterval(timer)
  }, [lastFetched])

  const sampleMatch = {
    id: 28295,
    round: "3rd T20I",
    type: "T20I",
    status: "1st Innings",
    localteam_dl_data: {
      score: null,
      overs: null,
      wickets_out: null
    },
    visitorteam_dl_data: {
      score: null,
      overs: null,
      wickets_out: null
    }
  }

  const displayMatches = matches.length > 0 ? matches : [sampleMatch]

  return (
    <Card className="h-full">
      <CardHeader className="border-b p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Live Cricket Scores</h2>
          {timeAgo && (
            <span className="text-xs text-gray-500">
              Updated {timeAgo}
            </span>
          )}
        </div>
        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0 overflow-y-auto">
        {isLoading && displayMatches.length === 0 ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="divide-y">
            {displayMatches.map((match) => (
              <div key={match.id} className="p-4 space-y-3">
                <div className="space-y-1">
                  <div className="font-medium">{match.round}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{match.type}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                    <span className="text-sm text-gray-500">{match.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Team 1</div>
                    <div className="text-2xl font-semibold">
                      {match.localteam_dl_data.score ?? "-"}/
                      {match.localteam_dl_data.wickets_out ?? "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.localteam_dl_data.overs ? `${match.localteam_dl_data.overs} overs` : "Yet to bat"}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Team 2</div>
                    <div className="text-2xl font-semibold">
                      {match.visitorteam_dl_data.score ?? "-"}/
                      {match.visitorteam_dl_data.wickets_out ?? "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.visitorteam_dl_data.overs ? `${match.visitorteam_dl_data.overs} overs` : "Yet to bat"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 