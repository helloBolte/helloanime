'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Calendar, Clock, Users, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import RecommendedAnime from '@/components/RecommendedAnime';

function AnimeDetailContent({ anime }) {
  // Determine if the anime is upcoming using AniList data.
  const isUpcoming = anime.status === 'NOT_YET_RELEASED';

  const getStatusColor = (status) => {
    switch (status) {
      case 'RELEASING':
        return 'text-green-400';
      case 'FINISHED':
        return 'text-blue-400';
      case 'NOT_YET_RELEASED':
        return 'text-yellow-400';
      case 'CANCELLED':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-gray-100"
    >
      <div className="relative h-40 sm:h-48 md:h-64 lg:h-96 overflow-hidden">
        <img
          src={anime?.bannerImage || anime.coverImage?.extraLarge}
          alt={anime?.title?.english || anime?.title?.romaji}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8 -mt-20 sm:-mt-24 md:-mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="md:w-1/3 relative">
            <img
              src={anime.coverImage.large}
              alt={anime.title.english || anime.title.romaji}
              className="w-48 h-auto mx-auto md:w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-2/3 flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">
              {anime.title.english || anime.title.romaji}
            </h1>
            <h2 className="text-lg sm:text-xl text-purple-300 mb-4">
              {anime.title.native}
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.map((genre) => (
                <Link key={genre} href={`/genre/${genre.toLowerCase()}`}>
                  <Badge variant="secondary" className="bg-purple-600/30 text-purple-200">
                    {genre}
                  </Badge>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                <span>{anime.averageScore / 10}/10</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                <span>{anime.seasonYear}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-400" />
                <span>{anime.duration} min</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                <span>{anime.popularity} fans</span>
              </div>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-300">Synopsis</h3>
              <p
                className="text-gray-300 line-clamp-3 sm:line-clamp-none"
                dangerouslySetInnerHTML={{ __html: anime.description }}
              ></p>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-purple-400">Details</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <strong>Format:</strong> {anime.format}
              </li>
              <li>
                <strong>Episodes:</strong> {anime.episodes}
              </li>
              <li>
                <strong>Status:</strong>{' '}
                <span className={getStatusColor(anime.status)}>{anime.status}</span>
              </li>
              <li>
                <strong>Aired:</strong>{' '}
                {`${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}`} to{' '}
                {anime.endDate.year
                  ? `${anime.endDate.year}-${anime.endDate.month}-${anime.endDate.day}`
                  : 'Present'}
              </li>
              <li>
                <strong>Season:</strong> {anime.season} {anime.seasonYear}
              </li>
              <li>
                <strong>Studio:</strong> {anime.studios.nodes[0]?.name || 'Unknown'}
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-purple-400">Characters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {anime.characters.nodes.slice(0, 6).map((character) => (
                <Link
                  href={`/character/${character.id}`}
                  key={character.id}
                  className="flex items-center space-x-2 hover:bg-gray-800 rounded-lg p-2 transition-colors"
                >
                  <img
                    src={character.image.medium}
                    alt={character.name.full}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-300">{character.name.full}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Suspense fallback={<div>Loading recommendations...</div>}>
          <RecommendedAnime recommendations={anime.recommendations.nodes} />
        </Suspense>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="fixed bottom-16 left-0 md:bottom-0 md:left-16 right-0 p-2 sm:p-4 bg-gray-900 bg-opacity-90 backdrop-blur-md z-50"
      >
        {!isUpcoming ? (
          <Link href={`/watch/${anime.id}`}>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3">
              <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-lg sm:text-xl">Watch Now</span>
            </Button>
          </Link>
        ) : (
          <Button
            disabled
            className="w-full bg-gray-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg cursor-not-allowed"
          >
            Soon to be added
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function AnimeDetailPage() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnimeDetails() {
      try {
        const data = await fetchAnimeData(id);
        setAnime(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching anime details:', error);
        setLoading(false);
      }
    }
    fetchAnimeDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="w-full h-64 mb-8" />
        <Skeleton className="w-2/3 h-10 mb-4" />
        <Skeleton className="w-full h-40 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-80" />
          <Skeleton className="w-full h-80" />
        </div>
      </div>
    );
  }

  if (!anime) {
    return <div className="container mx-auto px-4 py-8 text-center text-purple-500">Anime not found</div>;
  }

  return (
    <Suspense fallback={<div>Loading anime details...</div>}>
      <AnimeDetailContent anime={anime} />
    </Suspense>
  );
}

async function fetchAnimeData(animeId) {
  const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          extraLarge
        }
        bannerImage
        genres
        episodes
        status
        season
        seasonYear
        format
        duration
        averageScore
        popularity
        studios(isMain: true) {
          nodes {
            name
          }
        }
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
        characters(sort: ROLE, perPage: 6) {
          nodes {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
        recommendations(sort: RATING_DESC, perPage: 5) {
          nodes {
            mediaRecommendation {
              id
              title {
                romaji
              }
              coverImage {
                medium
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: { id: parseInt(animeId, 10) },
      }),
    });
    const data = await response.json();
    return data.data.Media;
  } catch (error) {
    console.error('Error fetching anime details:', error);
    throw new Error('Failed to fetch anime details');
  }
}
