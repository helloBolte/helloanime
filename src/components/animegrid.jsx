"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimeCard } from "@/components/animecard";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AnimeGrid() {
  const [activeTab, setActiveTab] = useState("newest");

  // Fetch all anime grid data from our API
  const { data, error, isLoading } = useSWR("/api/animeGrid", fetcher);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-lg" />
          ))}
      </div>
    );
  }

  if (error) {
    return <div>Error loading anime grid data</div>;
  }

  // The container animation variant
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  // Determine the corresponding document _id for each tab.
  // Here, "newest" maps to the "trending" category.
  const getCategoryMedia = (tabValue) => {
    const key = tabValue === "newest" ? "trending" : tabValue;
    return data.find((doc) => doc._id === key)?.media || [];
  };

  return (
    <Tabs defaultValue="newest" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="mb-4 bg-gray-800 p-1 rounded-lg">
        <TabsTrigger
          value="newest"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
        >
          NEWEST
        </TabsTrigger>
        <TabsTrigger
          value="popular"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
        >
          POPULAR
        </TabsTrigger>
        <TabsTrigger
          value="toprated"
          className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
        >
          TOP RATED
        </TabsTrigger>
      </TabsList>

      <TabsContent value="newest">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4"
        >
          {getCategoryMedia("newest").map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="popular">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4"
        >
          {getCategoryMedia("popular").map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="toprated">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4"
        >
          {getCategoryMedia("toprated").map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}
