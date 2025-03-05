"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchResults } from "./SearchResults";

const ANILIST_API = "https://graphql.anilist.co";

async function fetchAniListData(query, page = 1) {
  const searchQuery = `
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 10) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            medium
            large
          }
          averageScore
          episodes
          description
          status
        }
      }
    }
  `;

  const response = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: searchQuery,
      variables: { search: query, page },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();
  return data.data.Page.media;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || ""; // Use `.get()` instead of direct access
  const [animeData, setAnimeData] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (query) {
      fetchAniListData(query, page).then(setAnimeData);
    }
  }, [query, page]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-5 px-4">
        <h1 className="text-3xl font-bold mb-6 text-purple-300">
          Search Result: {query}
        </h1>

        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults initialData={animeData} initialQuery={query} />
        </Suspense>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="bg-purple-600 px-4 py-2 rounded mr-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-purple-600 px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8">
      {[...Array(10)].map((_, index) => (
        <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div className="w-full h-64 bg-gray-700 animate-pulse" />
          <div className="p-4">
            <div className="h-6 w-3/4 bg-gray-700 animate-pulse mb-2" />
            <div className="h-4 w-1/2 bg-gray-700 animate-pulse mb-2" />
            <div className="h-4 w-full bg-gray-700 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
