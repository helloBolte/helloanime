'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, PlayCircle, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ANILIST_API = 'https://graphql.anilist.co';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function getStatusColor(status) {
  switch (status) {
    case 'RELEASING':
      return 'text-green-500';
    case 'FINISHED':
      return 'text-blue-500';
    case 'NOT_YET_RELEASED':
      return 'text-yellow-500';
    case 'CANCELLED':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

function AnimeCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <Skeleton className="w-full h-64" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-16 w-full mb-2" />
        <div className="flex gap-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

async function fetchAnimeByGenre(genre, page = 1) {
  const query = `
    query ($genre: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(genre: $genre, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
          episodes
          status
          description
          genres
        }
      }
    }
  `;

  const variables = {
    genre,
    page,
    perPage: 24
  };

  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  const data = await response.json();
  return data.data.Page;
}

export default function AnimeGenreClient({ genre }) {
  const [animeList, setAnimeList] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await fetchAnimeByGenre(genre, currentPage);
        setAnimeList(data.media);
        setPageInfo(data.pageInfo);
      } catch (error) {
        console.error('Error fetching anime data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [genre, currentPage]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-purple-500 mb-8">
        {genre.charAt(0).toUpperCase() + genre.slice(1)} Anime
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array(12)
              .fill()
              .map((_, index) => <AnimeCardSkeleton key={index} />)
          : animeList.map((anime) => (
              <motion.div
                key={anime.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5 }}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/50 transition-shadow duration-300 group"
              >
                <Link href={`/anime/${anime.id}`}>
                  <div className="relative">
                    <img
                      src={anime.coverImage.large}
                      alt={anime.title.english || anime.title.romaji}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholder.svg?height=256&width=256';
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
                      {anime.title.english || anime.title.romaji}
                    </h3>
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      <span>{anime.averageScore / 10}/10</span>
                      <PlayCircle className="w-4 h-4 ml-3 mr-1" />
                      <span>{anime.episodes || 'N/A'} ep</span>
                    </div>
                    <div className="flex items-center text-sm mb-2">
                      <Radio className={`w-4 h-4 mr-1 ${getStatusColor(anime.status)}`} />
                      <span className={getStatusColor(anime.status)}>
                        {anime.status === 'RELEASING'
                          ? 'Airing'
                          : anime.status === 'FINISHED'
                          ? 'Finished'
                          : anime.status === 'NOT_YET_RELEASED'
                          ? 'Upcoming'
                          : anime.status === 'CANCELLED'
                          ? 'Cancelled'
                          : 'Unknown'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{anime.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {anime.genres.slice(0, 3).map((genre, index) => (
                        <Badge key={index} variant="secondary" className="bg-purple-600/30 text-purple-200 text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
      {pageInfo && !isLoading && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-purple-600 text-white px-4 py-2 rounded-l-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="bg-gray-700 text-white px-4 py-2">
            Page {currentPage} of {pageInfo.lastPage}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!pageInfo.hasNextPage}
            className="bg-purple-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
