'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, Clock, Calendar, PlayCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecommendedAnime({ recommendations }) {
  const [detailedRecommendations, setDetailedRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetailedRecommendations() {
      if (!recommendations || recommendations.length === 0) {
        setLoading(false);
        return;
      }

      const ids = recommendations.map(rec => rec.mediaRecommendation.id);
      try {
        const data = await fetchAnimeDetails(ids);
        setDetailedRecommendations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching detailed recommendations:', error);
        setLoading(false);
      }
    }

    fetchDetailedRecommendations();
  }, [recommendations]);

  async function fetchAnimeDetails(ids) {
    const query = `
      query ($ids: [Int]) {
        Page(page: 1, perPage: 50) {
          media(id_in: $ids, type: ANIME) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
              extraLarge
            }
            bannerImage
            genres
            averageScore
            seasonYear
            format
            episodes
            duration
            status
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: { ids: ids }
      })
    });

    const data = await response.json();
    return data.data.Page.media;
  }

  if (loading) {
    return (
      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-6 text-purple-400">Recommendations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="w-full h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (!detailedRecommendations || detailedRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold mb-6 text-purple-400">Recommendations</h3>
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
        {detailedRecommendations.map((anime) => (
          <RecommendedAnimeCard key={anime.id} anime={anime} />
        ))}
      </motion.div>
    </div>
  );
}

function RecommendedAnimeCard({ anime }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
      variants={itemVariants}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
    >
      <Link href={`/anime/${anime.id}`}>
        <div className="relative aspect-w-3 aspect-h-4">
          <img
            src={anime.coverImage?.extraLarge || anime.coverImage?.large || '/placeholder.svg?height=400&width=300'}
            alt={anime.title?.english || anime.title?.romaji || 'Anime cover'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h4 className="text-lg font-semibold text-white line-clamp-2 mb-2">
              {anime.title?.english || anime.title?.romaji || 'Unknown Title'}
            </h4>
            <div className="flex items-center text-sm text-white mb-2">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              <span>{anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {anime.genres && anime.genres.slice(0, 3).map((genre, index) => (
              <Badge key={index} variant="secondary" className="bg-purple-600/30 text-purple-200 text-xs">
                {genre}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{anime.seasonYear || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{anime.duration ? `${anime.duration} min` : 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <PlayCircle className="w-3 h-3 mr-1" />
              <span>{anime.episodes || 'N/A'} ep</span>
            </div>
            <div className="flex items-center">
              <span className={`text-xs ${getStatusColor(anime.status)}`}>
                {anime.status || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

