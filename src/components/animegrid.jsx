"use client"

import { useState } from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimeCard } from "@/components/animecard"
import { fetchAnilist } from "@/lib/anilist"

const ANIME_QUERY = `
  query ($sort: [MediaSort], $type: MediaType, $status: MediaStatus) {
    Page(page: 1, perPage: 20) {
      media(sort: $sort, type: $type, status: $status) {
        id
        title {
          userPreferred
        }
        coverImage {
          large
        }
        episodes
        seasonYear
        averageScore
        nextAiringEpisode {
          episode
        }
      }
    }
  }
`

export default function AnimeGrid() {
  const [activeTab, setActiveTab] = useState("newest")

  const { data: trendingData, isLoading: trendingLoading } = useSWR(["trending", ANIME_QUERY], () =>
    fetchAnilist(ANIME_QUERY, {
      sort: ["TRENDING_DESC"],
      type: "ANIME",
      status: "RELEASING",
    }),
  )

  const { data: popularData } = useSWR(activeTab === "popular" ? ["popular", ANIME_QUERY] : null, () =>
    fetchAnilist(ANIME_QUERY, {
      sort: ["POPULARITY_DESC"],
      type: "ANIME",
    }),
  )

  const { data: ratedData } = useSWR(activeTab === "toprated" ? ["rated", ANIME_QUERY] : null, () =>
    fetchAnilist(ANIME_QUERY, {
      sort: ["SCORE_DESC"],
      type: "ANIME",
    }),
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <Tabs defaultValue="newest" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="mb-4 bg-gray-800 p-1 rounded-lg">
        <TabsTrigger value="newest" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
          NEWEST
        </TabsTrigger>
        <TabsTrigger value="popular" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
          POPULAR
        </TabsTrigger>
        <TabsTrigger value="toprated" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
          TOP RATED
        </TabsTrigger>
      </TabsList>
      <TabsContent value="newest">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {trendingLoading
            ? Array(20)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-[300px] rounded-lg" />)
            : trendingData?.Page.media.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
        </motion.div>
      </TabsContent>
      <TabsContent value="popular">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {popularData?.Page.media.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </motion.div>
      </TabsContent>
      <TabsContent value="toprated">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {ratedData?.Page.media.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </motion.div>
      </TabsContent>
    </Tabs>
  )
}

