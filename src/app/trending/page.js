"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Calendar, Info } from "lucide-react"

// SWR fetcher that calls your internal trending API endpoint
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function TrendingAnimePage() {
  const [activeSeason, setActiveSeason] = useState("Summer")

  // Determine default season based on the current month
  useEffect(() => {
    const month = new Date().getMonth()
    let defaultSeason = "Summer"
    if (month >= 9) {
      defaultSeason = "Fall"
    } else if (month < 3) {
      defaultSeason = "Winter"
    }
    setActiveSeason(defaultSeason)
  }, [])

  // Fetch trending anime data from your API
  const { data, error, isLoading } = useSWR("/api/trending", fetcher)

  // Extract the media array from the document matching the activeSeason
  const filteredAnime = data
    ? data.find((doc) => doc._id === activeSeason)?.media || []
    : []

  // Helper: Get season year (based on activeSeason)
  const getSeasonYear = (season) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const month = now.getMonth()
    if (season === "Winter") {
      return month <= 2 ? currentYear : currentYear + 1
    }
    return currentYear
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-950 text-white p-4 md:p-8">
      <header className="mb-8">
        <motion.h1
          className="text-3xl md:text-5xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Trending Anime
        </motion.h1>
        <motion.div
          className="w-20 h-1 bg-purple-500 mx-auto rounded-full"
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </header>

      <Tabs
        defaultValue={activeSeason}
        value={activeSeason}
        onValueChange={setActiveSeason}
        className="w-full max-w-3xl mx-auto mb-8"
      >
        <div className="flex justify-center mb-4">
          <TabsList className="bg-black/40 border border-purple-800">
            <TabsTrigger
              value="Fall"
              className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Fall
            </TabsTrigger>
            <TabsTrigger
              value="Summer"
              className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Summer
            </TabsTrigger>
            <TabsTrigger
              value="Winter"
              className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Winter
            </TabsTrigger>
          </TabsList>
        </div>

        {["Fall", "Summer", "Winter"].map((season) => (
          <TabsContent key={season} value={season} className="mt-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <h2 className="text-xl md:text-2xl font-semibold text-center">
                  {season} {getSeasonYear(season)}
                </h2>
              </div>

              {isLoading ? (
                <AnimeSkeletonList />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={season}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {season === activeSeason &&
                      filteredAnime.map((anime, index) => (
                        <AnimeCard key={anime.id} anime={anime} index={index} />
                      ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function AnimeCard({ anime, index }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Truncate description
  const truncateDescription = (text, maxLength = 150) => {
    if (!text) return "No description available."
    const cleanText = text.replace(/<[^>]+>/g, "")
    if (cleanText.length <= maxLength) return cleanText
    return cleanText.substring(0, maxLength) + "..."
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-purple-800/50 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="relative w-full md:w-1/3 h-[200px] md:h-auto">
              <img
                src={anime.coverImage.large || anime.coverImage.medium}
                alt={anime.title.english || anime.title.romaji}
                className="w-full h-full object-cover"
              />
              {anime.averageScore && (
                <div className="absolute top-2 right-2 bg-purple-800 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                  {anime.averageScore}%
                </div>
              )}
            </div>

            <div className="p-4 flex-1">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xl font-bold text-purple-200">
                  {anime.title.english || anime.title.romaji}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2 text-white">
                  {anime.genres?.slice(0, 3).map((genre) => (
                    <span key={genre} className="text-xs bg-purple-900/70 px-2 py-1 rounded-full">
                      {genre}
                    </span>
                  ))}
                </div>
              </CardHeader>

              <div className="mt-2 text-sm text-gray-300">
                {anime.episodes && <div className="mb-1">Episodes: {anime.episodes}</div>}
                {anime.status && <div className="mb-3 capitalize">{anime.status.toLowerCase().replace("_", " ")}</div>}
              </div>

              <motion.div
                className="text-sm text-gray-300 mt-2"
                animate={{ height: isExpanded ? "auto" : "80px" }}
                transition={{ duration: 0.3 }}
              >
                <div className={`${!isExpanded && "line-clamp-3"}`}>
                  {anime.description
                    ? anime.description.replace(/<[^>]+>/g, "")
                    : "No description available."}
                </div>
              </motion.div>

              {anime.description && anime.description.length > 150 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-purple-400 text-sm flex items-center hover:text-purple-300 transition-colors"
                >
                  <Info className="h-3 w-3 mr-1" />
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function AnimeSkeletonList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="overflow-hidden border-purple-800/50 bg-black/40">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <Skeleton className="w-full md:w-1/3 h-[200px]" />
              <div className="p-4 flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/4 mt-4" />
                <Skeleton className="h-4 w-1/3 mt-2" />
                <div className="mt-4">
                  <Skeleton className="h-3 w-full mt-1" />
                  <Skeleton className="h-3 w-full mt-1" />
                  <Skeleton className="h-3 w-3/4 mt-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
