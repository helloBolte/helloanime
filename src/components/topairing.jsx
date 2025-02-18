"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tv, Calendar } from "lucide-react"
import { fetchAnilist } from "@/lib/anilist"

const TOP_AIRING_QUERY = `
  query {
    Page(page: 1, perPage: 10) {
      media(sort: POPULARITY_DESC, status: RELEASING, type: ANIME) {
        id
        title {
          userPreferred
        }
        coverImage {
          large
        }
        nextAiringEpisode {
          episode
        }
        seasonYear
        averageScore
      }
    }
  }
`

export default function TopAiring() {
  const { data, isLoading } = useSWR("topAiring", () => fetchAnilist(TOP_AIRING_QUERY))

  return (
    <Card className="w-full bg-gray-900 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-400">
          <Tv className="w-5 h-5" />
          TOP AIRING
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading
          ? Array(10)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-[100px] rounded-lg" />)
          : data?.Page.media.map((anime) => (
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
      </CardContent>
    </Card>
  )
}

