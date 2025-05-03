'use client';

import React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Calendar, Clock, Users, PlayCircle, Popcorn, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import RecommendedAnime from '@/components/RecommendedAnime';

function AnimeDetailContent({ anime }) {
  const isUpcoming = anime.status === 'NOT_YET_RELEASED';
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      RELEASING: 'text-green-400',
      FINISHED: 'text-blue-400',
      NOT_YET_RELEASED: 'text-yellow-400',
      CANCELLED: 'text-red-400'
    };
    return colors[status] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-pink-900/20">
      <AnimatePresence>
        {isScrolled && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm z-50 border-b border-pink-500/20"
          >
            <div className="container mx-auto px-4 py-3 flex items-center gap-4">
              <img 
                src={anime.coverImage.medium} 
                className="w-12 h-12 rounded-lg border-2 border-pink-500/30"
                alt="Cover"
              />
              <div>
                <h1 className="text-lg font-bold text-pink-300 line-clamp-1">
                  {anime.title.english || anime.title.romaji}
                </h1>
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <Star className="w-4 h-4" />
                  <span>{anime.averageScore/10}/10</span>
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="relative h-48 md:h-96 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute left-4 md:left-8 -bottom-8 z-20 group"
        >
          <div className="relative w-32 h-48 md:w-48 md:h-64 rounded-xl overflow-hidden shadow-2xl border-2 border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
            <img
              src={anime.coverImage.large}
              alt="Cover"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 via-transparent to-transparent" />
            <Sparkles className="absolute top-2 right-2 w-5 h-5 text-pink-400 opacity-70" />
          </div>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-pink-900/40 to-transparent" />
        <img
          src={anime.bannerImage || anime.coverImage.large}
          className="w-full h-full object-cover"
          alt="Banner"
        />

        <div className="absolute bottom-0 left-0 right-0 container px-4 pb-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between ml-[160px] md:ml-[220px]"
          >
            <div>
              <Badge className="bg-pink-600/30 backdrop-blur-sm text-pink-200 border border-pink-500/30">
                {anime.format}
              </Badge>
              <h2 className="text-2xl font-bold text-white mt-2 drop-shadow-lg">
                {anime.title.romaji}
              </h2>
            </div>
            <Sparkles className="text-pink-400 w-8 h-8" />
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6 sticky top-16 z-40 bg-gray-900/80 backdrop-blur-sm py-3 -mx-4 px-4">
          <Button 
            className="flex-1 bg-pink-600 hover:bg-pink-500 text-lg py-6 shadow-lg shadow-pink-900/30"
            asChild
          >
            <Link href={`/watch/${anime.id}`}>
              <PlayCircle className="mr-2" />
              Watch Now
            </Link>
          </Button>
          {anime.trailer?.site === 'youtube' && anime.trailer.id ? (
  <Button
    variant="secondary"
    className="flex-1 text-lg py-6 border border-pink-500/20"
    asChild
  >
    <a
      href={`https://www.youtube.com/watch?v=${anime.trailer.id}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Popcorn className="mr-2" />
      Trailer
    </a>
  </Button>
) : (
  <Button
    variant="secondary"
    className="flex-1 text-lg py-6 border border-pink-500/20"
    disabled
  >
    <Popcorn className="mr-2" />
    No Trailer
  </Button>
)}

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-900/30 rounded-lg text-pink-400">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-pink-300/80">Score</div>
                <div className="text-xl font-bold text-pink-200">{anime.averageScore/10}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-900/30 rounded-lg text-pink-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-pink-300/80">Episodes</div>
                <div className="text-xl font-bold text-pink-200">{anime.episodes}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-900/30 rounded-lg text-pink-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-pink-300/80">Year</div>
                <div className="text-xl font-bold text-pink-200">{anime.seasonYear}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-900/30 rounded-lg text-pink-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-pink-300/80">Rank</div>
                <div className="text-xl font-bold text-pink-200">#{anime.popularity}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {anime.genres.map((genre) => (
            <Link key={genre} href={`/genre/${genre}`}>
              <Badge className="bg-pink-900/30 backdrop-blur-sm hover:bg-pink-800/40 text-pink-200 border border-pink-800/30">
                {genre}
              </Badge>
            </Link>
          ))}
        </div>

        <motion.div 
          className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl border border-pink-500/20 mb-6"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <h3 className="text-xl font-bold text-pink-300 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Storyline
          </h3>
          <p className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: anime.description }} />
        </motion.div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-pink-300 mb-4">Main Cast</h3>
          <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4 scrollbar-hide">
            {anime.characters.nodes.map((character) => (
              <Link
                key={character.id}
                href={`/character/${character.id}`}
                className="flex flex-col items-center w-28 flex-shrink-0 group"
              >
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-pink-500/30 group-hover:border-pink-500/50 transition-colors">
                  <img
                    src={character.image.medium}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform"
                    alt={character.name.full}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-900/50 via-transparent to-transparent" />
                </div>
                <span className="text-sm text-center text-pink-200 mt-2 line-clamp-2">
                  {character.name.full}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-pink-500/20 p-4 mb-6">
          <div className="flex items-center justify-between py-3 border-b border-pink-500/10">
            <div className="flex items-center gap-2 text-pink-400">
              <Calendar className="w-5 h-5" />
              <span className="text-pink-300/90">Aired</span>
            </div>
            <span className="text-pink-200 text-sm">
              {`${anime.startDate.year}-${anime.startDate.month} to ${anime.endDate.year || 'Present'}`}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-pink-500/10">
            <div className="flex items-center gap-2 text-pink-400">
              <Star className="w-5 h-5" />
              <span className="text-pink-300/90">Status</span>
            </div>
            <span className="text-pink-200 text-sm">{anime.status}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 text-pink-400">
              <Users className="w-5 h-5" />
              <span className="text-pink-300/90">Studio</span>
            </div>
            <span className="text-pink-200 text-sm">{anime.studios.nodes[0]?.name || '-'}</span>
          </div>
        </div>

        <Suspense fallback={<Skeleton className="w-full h-64 rounded-xl" />}>
          <RecommendedAnime recommendations={anime.recommendations.nodes} />
        </Suspense>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-pink-500/20 z-50">
        <div className="container mx-auto px-4 py-3 flex gap-2">
          <Button className="flex-1 bg-pink-600 hover:bg-pink-500" asChild>
            <Link href={`/watch/${anime.id}`}>
              <PlayCircle className="mr-2" />
              Watch
            </Link>
          </Button>
          <Button variant="secondary" className="flex-1" size="sm">
            <Popcorn className="mr-2" />
            More
          </Button>
        </div>
      </div>
    </div>
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
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <Skeleton className="w-full aspect-[3/4] rounded-xl" />
          </div>
          <div className="md:w-2/3 space-y-4">
            <Skeleton className="w-2/3 h-10" />
            <Skeleton className="w-1/2 h-6" />
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-20 h-8 rounded-full" />
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-full h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="w-full h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-pink-500 text-xl">
        Anime not found
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="text-pink-400 text-center py-8">Loading anime details...</div>}>
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
          medium
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
        characters(sort: ROLE, perPage: 4) {
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
          trailer {
            site
            id
            thumbnail
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