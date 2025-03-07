"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, Clock } from "lucide-react"
import Image from "next/image"

// Fetch anime schedule from AniList API using UTC dates
const fetchAnimeSchedule = async (weekOffset = 0) => {
  const currentDate = new Date()

  // Calculate the start of the week in UTC (Sunday 00:00 UTC)
  const startOfWeek = new Date(
    Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate() - currentDate.getUTCDay() + weekOffset * 7,
      0,
      0,
      0,
      0, // Set to 00:00:00 UTC
    ),
  )

  // Calculate the end of the week in UTC as next Sunday 00:00 UTC (exclusive)
  const endOfWeek = new Date(
    Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate() - currentDate.getUTCDay() + weekOffset * 7 + 7,
      0,
      0,
      0,
      0,
    ),
  )

  console.log("Fetching from:", startOfWeek.toISOString(), "to", endOfWeek.toISOString())

  const query = `
    query ($start: Int, $end: Int) {
      Page(perPage: 100) {
        airingSchedules(airingAt_greater: $start, airingAt_lesser: $end) {
          airingAt
          episode
          media {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  `

  const variables = {
    start: Math.floor(startOfWeek.getTime() / 1000),
    end: Math.floor(endOfWeek.getTime() / 1000),
  }

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  })

  const data = await response.json()
  return data.data.Page.airingSchedules
}

export default function AnimeSchedule() {
  const [schedule, setSchedule] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState(new Date().getUTCDay())

  // Group fetched data by day index and time using UTC
  const groupDataByDay = (data) => {
    return data.reduce((acc, anime) => {
      const airTime = new Date(anime.airingAt * 1000) // Convert to milliseconds
      const dayIndex = airTime.getUTCDay() // Use UTC day
      const timeString = airTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC", // Ensure time is in UTC
      })

      if (!acc[dayIndex]) acc[dayIndex] = {}
      if (!acc[dayIndex][timeString]) acc[dayIndex][timeString] = []
      acc[dayIndex][timeString].push(anime)
      return acc
    }, {})
  }

  // Fetch schedules for both weeks concurrently on mount
  useEffect(() => {
    const fetchAllWeeks = async () => {
      try {
        const [currentWeekData, nextWeekData] = await Promise.all([fetchAnimeSchedule(0), fetchAnimeSchedule(1)])
        setSchedule({
          0: groupDataByDay(currentWeekData),
          1: groupDataByDay(nextWeekData),
        })
      } catch (error) {
        console.error("Error fetching schedules:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllWeeks()
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
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-200">
              Anime Schedule
            </h1>
            <motion.div
              className="w-20 h-1 bg-purple-500 rounded-full mt-2"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>

          <motion.button
            onClick={() => setWeekOffset(weekOffset === 0 ? 1 : 0)}
            className="flex items-center justify-center gap-2 bg-purple-800 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto transition-colors duration-200 border border-purple-600"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <CalendarDays size={20} />
            <span>{weekOffset === 0 ? "Next Week" : "Current Week"}</span>
          </motion.button>
        </motion.div>
      </header>

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
          {days.map((day, index) => (
            <TabsContent key={day} value={day} className="mt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isLoading ? (
                  <ScheduleSkeleton />
                ) : schedule[weekOffset] && schedule[weekOffset][index] ? (
                  Object.entries(schedule[weekOffset][index])
                    .sort((a, b) => {
                      // Sort times chronologically
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
                            <AnimeCard key={`${anime.media.id}-${idx}`} anime={anime} index={idx} />
                          ))}
                        </div>
                      </motion.div>
                    ))
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
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className="border-purple-800/30 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-start p-3">
            <div className="relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-md overflow-hidden">
              <Image
                src={anime.media.coverImage.large || "/placeholder.svg?height=96&width=80"}
                alt={anime.media.title.english || anime.media.title.romaji}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 64px, 80px"
              />
              <div className="absolute bottom-0 right-0 bg-purple-800 text-white text-xs font-bold px-1.5 py-0.5 rounded-tl-md">
                EP {anime.episode}
              </div>
            </div>

            <div className="ml-3 flex-1 overflow-hidden">
              <h3 className="font-bold text-sm sm:text-base text-purple-200 line-clamp-2">
                {anime.media.title.english || anime.media.title.romaji}
              </h3>

              <div className="mt-1 flex flex-wrap gap-2">
                <span className="text-xs bg-purple-900/70 px-2 py-0.5 rounded-full">Episode {anime.episode}</span>
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
          <Skeleton className="h-7 w-32 mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, idx) => (
                <Card key={idx} className="border-purple-800/30 bg-black/40 overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-start">
                      <Skeleton className="w-16 h-20 sm:w-20 sm:h-24 rounded-md" />
                      <div className="ml-3 flex-1">
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-4 w-1/2" />
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

