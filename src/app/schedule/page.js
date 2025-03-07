"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";
import Image from "next/image";

// Fetch anime schedule from AniList API using UTC dates
const fetchAnimeSchedule = async (weekOffset = 0) => {
  const currentDate = new Date();

  // Calculate the start of the week in UTC (Sunday 00:00 UTC)
  const startOfWeek = new Date(Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate() - currentDate.getUTCDay() + (weekOffset * 7),
    0, 0, 0, 0 // Set to 00:00:00 UTC
  ));

  // Calculate the end of the week in UTC as next Sunday 00:00 UTC (exclusive)
  const endOfWeek = new Date(Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate() - currentDate.getUTCDay() + (weekOffset * 7) + 7,
    0, 0, 0, 0
  ));

  console.log("Fetching from:", startOfWeek.toISOString(), "to", endOfWeek.toISOString());

  const query = `
    query ($start: Int, $end: Int) {
      Page(perPage: 100) {
        airingSchedules(airingAt_greater: $start, airingAt_lesser: $end) {
          airingAt
          episode
          media {
            title {
              romaji
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  `;

  const variables = {
    start: Math.floor(startOfWeek.getTime() / 1000),
    end: Math.floor(endOfWeek.getTime() / 1000),
  };

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  return data.data.Page.airingSchedules;
};

export default function AnimeSchedule() {
  const [schedule, setSchedule] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(new Date().getUTCDay());

  // Group fetched data by day index and time using UTC
  const groupDataByDay = (data) => {
    return data.reduce((acc, anime) => {
      const airTime = new Date(anime.airingAt * 1000); // Convert to milliseconds
      const dayIndex = airTime.getUTCDay(); // Use UTC day
      const timeString = airTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC", // Ensure time is in UTC
      });

      if (!acc[dayIndex]) acc[dayIndex] = {};
      if (!acc[dayIndex][timeString]) acc[dayIndex][timeString] = [];
      acc[dayIndex][timeString].push(anime);
      return acc;
    }, {});
  };

  // Fetch schedules for both weeks concurrently on mount
  useEffect(() => {
    const fetchAllWeeks = async () => {
      try {
        const [currentWeekData, nextWeekData] = await Promise.all([
          fetchAnimeSchedule(0),
          fetchAnimeSchedule(1),
        ]);
        setSchedule({
          0: groupDataByDay(currentWeekData),
          1: groupDataByDay(nextWeekData),
        });
      } catch (error) {
        console.error("Error fetching schedules:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllWeeks();
  }, []);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-black text-white p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-400">Anime Schedule</h1>
        <button
          onClick={() => setWeekOffset(weekOffset === 0 ? 1 : 0)}
          className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
        >
          <CalendarDays size={20} />
          <span>{weekOffset === 0 ? "Next Week" : "Current Week"}</span>
        </button>
      </div>

      <Tabs defaultValue={days[selectedDay]}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="bg-gray-900 p-2 rounded-lg flex w-full sm:justify-between">
            {days.map((day, idx) => (
              <TabsTrigger
                key={day}
                value={day}
                className="text-white data-[state=active]:bg-purple-500 px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap"
                onClick={() => setSelectedDay(days.indexOf(day))}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{shortDays[idx]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {days.map((day, index) => (
          <TabsContent key={day} value={day} className="mt-4">
            {isLoading ? (
              // Show skeleton while loading
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : schedule[weekOffset] && schedule[weekOffset][index] ? (
              Object.entries(schedule[weekOffset][index]).map(([time, animes]) => (
                <div key={time} className="mb-6">
                  <h2 className="text-lg font-bold text-purple-400">{time}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                    {animes.map((anime, idx) => (
                      <Card key={idx} className="border border-purple-500 overflow-hidden bg-gray-900">
                        <CardContent className="p-3 flex items-center">
                          <div className="flex-shrink-0">
                            <Image
                              src={anime.media.coverImage.large || "/placeholder.svg"}
                              alt={anime.media.title.romaji}
                              width={50}
                              height={50}
                              className="rounded-md object-cover"
                            />
                          </div>
                          <div className="ml-3 overflow-hidden">
                            <h3 className="text-white font-bold text-sm truncate">
                              {anime.media.title.romaji}
                            </h3>
                            <div className="flex flex-wrap text-xs sm:text-sm text-gray-300 gap-2 mt-1">
                              <span className="bg-purple-700 px-2 py-1 rounded">{time}</span>
                              <span className="bg-gray-700 px-2 py-1 rounded">EP {anime.episode}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No anime scheduled for this day.</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
