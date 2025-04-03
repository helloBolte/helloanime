"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, Clock } from "lucide-react"
import Image from "next/image"

// Fetch schedule data from our custom API endpoint
const fetchSchedule = async () => {
  const response = await fetch("/api/schedule")
  const data = await response.json()
  // Assume data is an array with a single schedule document.
  return data[0]
}

export default function AnimeSchedule() {
  const [schedule, setSchedule] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(new Date().getUTCDay())

  // Group anime by their airing time (UTC) for a given day array.
  const groupDataByTime = (data) => {
    return data.reduce((acc, anime) => {
      // Using airingAt directly if it is in milliseconds; adjust if needed.
      const airTime = new Date(anime.airingAt)
      const timeString = airTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      })
      if (!acc[timeString]) acc[timeString] = []
      acc[timeString].push(anime)
      return acc
    }, {})
  }

  useEffect(() => {
    const getSchedule = async () => {
      try {
        const sched = await fetchSchedule()
        setSchedule(sched)
      } catch (error) {
        console.error("Error fetching schedule:", error)
      } finally {
        setIsLoading(false)
      }
    }
    getSchedule()
  }, [])

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-950 text-white p-4 md:p-8">
      <header className="mb-8">
        <motion.div
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-200 text-center">
              Anime Schedule
            </h1>
            <motion.div
              className="w-20 h-1 bg-purple-500 rounded-full mt-2 mx-auto"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </motion.div>
      </header>

      {/* Advertisement Banner */}
      <AdBanner />

      <Tabs
        defaultValue={days[selectedDay]}
        value={days[selectedDay]}
        onValueChange={(value) => setSelectedDay(days.indexOf(value))}
        className="w-full"
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="bg-black/40 border border-purple-800/50 p-1 rounded-lg flex w-full">
            {days.map((day, idx) => (
              <TabsTrigger
                key={day}
                value={day}
                className="text-white data-[state=active]:bg-purple-800 data-[state=active]:text-white px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{shortDays[idx]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          {days.map((day) => (
            <TabsContent key={day} value={day} className="mt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isLoading ? (
                  <ScheduleSkeleton />
                ) : schedule && schedule[day.toLowerCase()] && schedule[day.toLowerCase()].length > 0 ? (
                  (() => {
                    const grouped = groupDataByTime(schedule[day.toLowerCase()])
                    return Object.entries(grouped)
                      .sort((a, b) => {
                        const timeA = new Date(`01/01/2023 ${a[0]}`).getTime()
                        const timeB = new Date(`01/01/2023 ${b[0]}`).getTime()
                        return timeA - timeB
                      })
                      .map(([time, animes], timeIndex) => (
                        <motion.div
                          key={time}
                          className="mb-8"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: timeIndex * 0.1 }}
                        >
                          <div className="flex items-center mb-3">
                            <Clock className="h-5 w-5 text-purple-400 mr-2" />
                            <h2 className="text-xl font-bold text-purple-300">{time}</h2>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {animes.map((anime, idx) => (
                              <AnimeCard key={`${anime.id}-${idx}`} anime={anime} index={idx} />
                            ))}
                          </div>
                        </motion.div>
                      ))
                  })()
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <CalendarDays className="h-16 w-16 text-purple-700 mb-4 opacity-50" />
                    <p className="text-gray-400 text-lg">No anime scheduled for this day.</p>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>
    </div>
  )
}

function AnimeCard({ anime, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="border-purple-800/30 bg-gradient-to-br from-black/80 to-purple-950/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 overflow-hidden h-full shadow-lg shadow-purple-900/20 hover:shadow-purple-700/30">
        <CardContent className="p-0 h-full">
          <div className="relative h-full">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/10 rounded-full -ml-8 -mb-8 blur-xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-start p-4 h-full">
              <div className="relative flex-shrink-0 w-full sm:w-24 h-32 sm:h-32 rounded-lg overflow-hidden mb-3 sm:mb-0 group">
                <Image
                  src={anime.coverImage || "/placeholder.svg?height=128&width=96"}
                  alt={anime.title.english || anime.title.romaji}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100%, 96px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
                <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-tl-md">
                  EP {anime.airingEpisode}
                </div>
              </div>

              <div className="sm:ml-4 flex-1 overflow-hidden flex flex-col justify-between h-full">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white line-clamp-2 leading-tight">
                    {anime.title.english || anime.title.romaji}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-white bg-purple-700 px-2.5 py-1 rounded-full inline-flex items-center">
                      <span className="w-1.5 h-1.5 bg-purple-300 rounded-full mr-1.5 animate-pulse"></span>
                      Episode {anime.airingEpisode}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-purple-800/30 text-xs text-purple-300/80 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>
                    {new Date(anime.airingAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "UTC",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((timeBlock) => (
        <div key={timeBlock} className="mb-6">
          <Skeleton className="h-7 w-32 mb-3 bg-purple-800/30" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, idx) => (
                <Card
                  key={idx}
                  className="border-purple-800/30 bg-gradient-to-br from-black/80 to-purple-950/40 overflow-hidden shadow-lg shadow-purple-900/20"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start">
                      <Skeleton className="w-full sm:w-24 h-32 rounded-lg mb-3 sm:mb-0 bg-purple-800/20" />
                      <div className="sm:ml-4 flex-1">
                        <Skeleton className="h-5 w-full mb-2 bg-purple-800/20" />
                        <Skeleton className="h-4 w-3/4 mb-3 bg-purple-800/20" />
                        <Skeleton className="h-6 w-1/3 mb-3 bg-purple-800/20" />
                        <Skeleton className="h-3 w-1/2 bg-purple-800/20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AdBanner() {
  return (
    <div id="frame" style={{ width: "100%", height: "100%", marginBottom: "1.5rem" }}>
      <iframe
        data-aa="2388513"
        src="//acceptable.a-ads.com/2388513"
        style={{
          border: "0px",
          padding: "0",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "transparent",
        }}
      ></iframe>
      <a
        style={{
          display: "block",
          textAlign: "right",
          fontSize: "12px",
        }}
        id="preview-link"
        href="https://aads.com/campaigns/new/?source_id=2388513&source_type=ad_unit&partner=2388513"
      >
        Advertise here
      </a>
    </div>
  )
}
