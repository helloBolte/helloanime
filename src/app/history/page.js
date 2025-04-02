"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      // Get all cookies from document.cookie
      const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
      // Filter for cookies that start with "watchSettings_"
      const historyCookies = cookies.filter((cookie) =>
        cookie.startsWith("watchSettings_")
      );
      // Parse each cookie's value and include the anilistId extracted from the key
      const historyData = historyCookies
        .map((cookie) => {
          const [key, value] = cookie.split("=");
          try {
            const decoded = decodeURIComponent(value);
            const parsed = JSON.parse(decoded);
            // Extract anilistId from key e.g. "watchSettings_21856"
            const anilistId = key.replace("watchSettings_", "");
            return { key, anilistId, ...parsed };
          } catch (error) {
            console.error("Error parsing cookie", cookie, error);
            return null;
          }
        })
        .filter(Boolean);
      setHistory(historyData);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Watching History</h1>
      {history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((item) => (
            <li key={item.key} className="bg-gray-800 p-4 rounded shadow">
              <Link href={`/watch/${item.anilistId}`} className="flex items-center space-x-4">
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt="Thumbnail"
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div>
                  <p>
                    <span className="font-semibold">Provider:</span> {item.provider}
                  </p>
                  <p>
                    <span className="font-semibold">Episode:</span> {item.episode}
                  </p>
                  <p>
                    <span className="font-semibold">Audio:</span> {item.audio}
                  </p>
                  <p>
                    <span className="font-semibold">Last Watched:</span>{" "}
                    {Math.floor(item.currentTime)} seconds
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
