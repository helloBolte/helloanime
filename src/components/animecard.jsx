"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tv } from "lucide-react"

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function AnimeCard({ anime }) {
  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden hover:scale-105 transition-transform bg-gray-900 text-white h-full">
        <CardContent className="p-0 relative h-full">
          <div className="relative aspect-[3/4]">
            <img
              src={anime.coverImage.large || "/placeholder.svg"}
              alt={anime.title.userPreferred}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg line-clamp-2 mb-1">
                {anime.title.userPreferred}
              </h3>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-300 text-xs sm:text-sm">
                <Tv className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>
                  {anime.nextAiringEpisode
                    ? `EP ${anime.nextAiringEpisode.episode - 1}`
                    : `${anime.episodes || "?"} EP`}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{anime.seasonYear}</span>
                {anime.averageScore && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>{anime.averageScore}%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

