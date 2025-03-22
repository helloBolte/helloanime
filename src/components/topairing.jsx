"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tv, Calendar } from "lucide-react"

// SWR fetcher function that calls our topairing API endpoint
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function TopAiring() {
  // Use SWR to fetch data from our API
  const { data, error, isLoading } = useSWR("/api/topairing", fetcher)

  // Extract the media array from our API data (if available)
  const topAiringMedia = data && data.length > 0 ? data[0].media : []

  return (
    <Card className="w-full bg-gray-900 text-white h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-400">
          <Tv className="w-5 h-5" />
          TOP AIRING
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
        <div className="space-y-4">
          {isLoading || !data
            ? Array(10)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-3 p-2">
                    <Skeleton className="w-16 h-24 rounded" />
                    <div className="flex flex-col justify-between flex-1">
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-4 w-1/2 rounded" />
                    </div>
                  </div>
                ))
            : topAiringMedia.map((anime) => (
                <div
                  key={anime.id}
                  className="flex gap-3 hover:bg-gray-800 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <img
                    src={anime.coverImage.large || "/placeholder.svg"}
                    alt={anime.title.userPreferred}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex flex-col justify-between py-1">
                    <h4 className="font-medium line-clamp-2 text-white">{anime.title.userPreferred}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{anime.seasonYear}</span>
                      <span>•</span>
                      <span>EP {anime.nextAiringEpisode?.episode - 1}</span>
                    </div>
                  </div>
                </div>
              ))}
          {error && <p className="text-red-500">Error loading data.</p>}
        </div>
      </CardContent>
    </Card>
  )
}
