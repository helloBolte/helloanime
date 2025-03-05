"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";
import Image from "next/image";

// Fetch anime schedule from AniList API
const fetchAnimeSchedule = async (weekOffset = 0) => {
  const currentDate = new Date();
  const startOfWeek = new Date(
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7 * weekOffset)
  );
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

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
  // We'll store schedules for weekOffset 0 and 1 as an object:
  // { 0: { 0: {...}, 1: {...}, ... }, 1: { 0: {...}, 1: {...}, ... } }
  const [schedule, setSchedule] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  // Default the selected day to the current day (0 for Sunday, 1 for Monday, etc.)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  // Group fetched data by day index and time
  const groupDataByDay = (data) => {
    return data.reduce((acc, anime) => {
      const airTime = new Date(anime.airingAt * 1000);
      const dayIndex = airTime.getDay();
      const timeString = airTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-purple-400">Anime Schedule</h1>
        <button
          onClick={() => setWeekOffset(weekOffset === 0 ? 1 : 0)}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          <CalendarDays size={20} />
          {weekOffset === 0 ? "Next Week" : "Current Week"}
        </button>
      </div>

      <Tabs defaultValue={days[selectedDay]}>
        <TabsList className="bg-gray-900 p-2 rounded-lg flex justify-between">
          {days.map((day) => (
            <TabsTrigger
              key={day}
              value={day}
              className="text-white data-[state=active]:bg-purple-500 px-4 py-2 rounded-lg"
              onClick={() => setSelectedDay(days.indexOf(day))}
            >
              {day}
            </TabsTrigger>
          ))}
        </TabsList>

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
                  <div className="flex gap-4 mt-2 flex-wrap">
                    {animes.map((anime, idx) => (
                      <Card
                        key={idx}
                        className="border border-purple-500 w-72 overflow-hidden bg-gray-900"
                      >
                        <CardContent className="p-3 flex items-center">
                          <Image
                            src={anime.media.coverImage.large}
                            alt={anime.media.title.romaji}
                            width={50}
                            height={50}
                            className="rounded-md"
                          />
                          <div className="ml-3">
                            <h3 className="text-white font-bold">
                              {anime.media.title.romaji}
                            </h3>
                            <div className="flex text-sm text-gray-300 gap-2 mt-1">
                              <span className="bg-purple-700 px-2 py-1 rounded">{time}</span>
                              <span className="bg-gray-700 px-2 py-1 rounded">
                                EP {anime.episode}
                              </span>
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
