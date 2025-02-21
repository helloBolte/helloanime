"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, PlayCircle, Radio } from "lucide-react";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const getStatusColor = (status) => {
  switch (status) {
    case "RELEASING":
      return "text-green-400";
    case "FINISHED":
      return "text-blue-400";
    case "NOT_YET_RELEASED":
      return "text-yellow-400";
    case "CANCELLED":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

export function AnimeCard({ anime }) {
  return (
    <motion.div
      variants={item}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/50 transition-shadow duration-300 group"
    >
      <a href={`/anime/${anime.id}`} className="block">
        <div className="relative">
          <img
            src={anime.coverImage.large || "/placeholder.svg"}
            alt={anime.title.userPreferred}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors duration-300">
              View Details
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-purple-200 line-clamp-1">
            {anime.title.userPreferred}
          </h3>
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            <span>{anime.averageScore / 10}/10</span>
            <PlayCircle className="w-4 h-4 ml-3 mr-1" />
            <span>
              {anime.nextAiringEpisode
                ? `${anime.nextAiringEpisode.episode - 1}/${anime.episodes}`
                : anime.episodes || "?"}{" "}
              ep
            </span>
          </div>
          <div className="flex items-center text-sm mb-2">
            <Radio className={`w-4 h-4 mr-1 ${getStatusColor(anime.status)}`} />
            <span className={getStatusColor(anime.status)}>
              {anime.status === "RELEASING"
                ? "Airing"
                : anime.status === "FINISHED"
                ? "Finished"
                : anime.status === "NOT_YET_RELEASED"
                ? "Upcoming"
                : anime.status === "CANCELLED"
                ? "Cancelled"
                : "Unknown"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {anime.genres.slice(0, 3).map((genre, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-purple-600/30 text-purple-200 text-xs"
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </a>
    </motion.div>
  );
}
