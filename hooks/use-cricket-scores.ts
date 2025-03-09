import { useState, useEffect } from 'react'

interface DLData {
  score: number | null
  overs: number | null
  wickets_out: number | null
}

interface CricketMatch {
  id: number
  round: string
  type: string
  status: string
  localteam_id: number
  visitorteam_id: number
  total_overs_played: number
  localteam_dl_data: DLData
  visitorteam_dl_data: DLData
}

export function useCricketScores() {
  const [matches, setMatches] = useState<CricketMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<number | null>(null)

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`https://cricket.sportmonks.com/api/v2.0/livescores?api_token=${process.env.NEXT_PUBLIC_CRICKET_API_TOKEN}`)
        const data = await response.json()
        setMatches(data.data)
        setLastFetched(Date.now())
        setError(null)
      } catch (err) {
        setError('Failed to fetch cricket scores')
      } finally {
        setIsLoading(false)
      }
    }

    fetchScores()
    const interval = setInterval(fetchScores, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return { matches, isLoading, error, lastFetched }
} 