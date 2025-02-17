"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tv } from "lucide-react";
import { fetchAnilist } from "@/lib/anilist";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function AnimeCard({ anime }) {
  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden hover:scale-105 transition-transform">
        <CardContent className="p-0 relative">
          <div className="relative aspect-[3/4]">
            <img
              src={anime.coverImage.large || "/placeholder.svg"}
              alt={anime.title.userPreferred}
              className="object-cover w-full h-full"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-white font-semibold line-clamp-2">{anime.title.userPreferred}</h3>
              <div className="flex items-center gap-2 text-gray-300 text-sm mt-1">
                <Tv className="w-4 h-4" />
                <span>
                  {anime.nextAiringEpisode
                    ? `EP ${anime.nextAiringEpisode.episode - 1}`
                    : `${anime.episodes || "?"} EP`}
                </span>
                <span>•</span>
                <span>{anime.seasonYear}</span>
                {anime.averageScore && (
                  <>
                    <span>•</span>
                    <span>{anime.averageScore}%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
