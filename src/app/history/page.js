"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Play } from "lucide-react"; // Import play button from lucide-react

// Reuse the same image proxy helper
const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("https://img.gojo.wtf/")) {
    return `/api/gimg?url=${encodeURIComponent(url)}`;
  }
  return url;
};

// Enhanced cookie helper that stores all needed data
function getContinueWatching() {
  if (typeof document === "undefined") return [];
  
  const cookies = document.cookie.split('; ');
  const items = [];

  cookies.forEach(cookie => {
    if (cookie.startsWith("watchSettings_")) {
      const [key, value] = cookie.split('=');
      try {
        const data = JSON.parse(decodeURIComponent(value));
        // Only include if we have all required data
        if (data.animeTitle && data.thumbnailUrl) {
          items.push({
            anilistId: key.replace('watchSettings_', ''),
            ...data,
            timestamp: data.timestamp || new Date().getTime()
          });
        }
      } catch (e) {
        console.error('Error parsing cookie:', key);
      }
    }
  });

  return items.sort((a, b) => b.timestamp - a.timestamp);
}

// Modified version of setCookie to store additional data
export function setWatchCookie(anilistId, data) {
  const fullData = {
    ...data,
    timestamp: new Date().getTime(),
    animeTitle: data.animeTitle || "Unknown",
    thumbnailUrl: data.thumbnailUrl || ""
  };

  const cookieValue = encodeURIComponent(JSON.stringify(fullData));
  document.cookie = `watchSettings_${anilistId}=${cookieValue}; expires=${new Date(Date.now() + 365 * 864e5).toUTCString()}; path=/`;
}

export default function ContinueWatchingPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Client-side only
    setItems(getContinueWatching());
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Continue Watching</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg bg-[#1f1f1f]" />
            ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-xl mb-2">Nothing to continue watching</div>
          <p className="text-sm">Your progress will appear here as you watch</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <Link
              key={`${item.anilistId}-${item.episode}`}
              href={{
                pathname: `/watch/${item.anilistId}`,
                query: {
                  episode: item.episode,
                  audio: item.audio,
                  provider: item.provider
                }
              }}
              className="group relative block rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 shadow-lg"
            >
              <div className="relative aspect-[2/3]">
                <img
                  src={getImageUrl(item.thumbnailUrl)}
                  alt={item.animeTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-anime.jpg';
                  }}
                />
                
                {/* Centered Play Button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-3">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                {/* Progress indicator (example - you'd need to store progress in cookie) */}
                {item.progress && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${Math.min(100, item.progress)}%` }}
                    />
                  </div>
                )}
              </div>
              
              <div className="p-2 bg-[#1a1a1a]">
                <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                  {item.animeTitle}
                </h3>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Ep {item.episode}</span>
                  <span className="capitalize">{item.audio}</span>
                </div>
              </div>
              
              {/* Server badge */}
              <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {item.provider === 'strix' ? 'S1' : 'S2'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
