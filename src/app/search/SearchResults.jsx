'use client';

import { motion } from 'framer-motion';
import { Star, Clock, Radio } from 'lucide-react';
import Link from 'next/link';

export function SearchResults({ initialData, initialQuery }) {
  const results = initialData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
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

  if (results.length === 0 && initialQuery) {
    return <p className="text-center text-gray-400 mt-8">No results found for "{initialQuery}"</p>;
  }

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {results.map((anime) => (
        <motion.div 
          key={anime.id} 
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/50 transition-shadow duration-300 group"
          variants={itemVariants}
        >
          <Link href={`/anime/${anime.id}`}>
            <div className="relative">
              <img
                src={anime.coverImage.large}
                alt={anime.title.romaji}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.svg?height=256&width=256';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-purple-600 text-white px-4 py-2 rounded-full">
                  View Details
                </span>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2 text-purple-200 line-clamp-1">{anime.title.english || anime.title.romaji}</h2>
              <div className="flex items-center text-sm text-gray-400 mb-2">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                <span>{anime.averageScore / 10}/10</span>
                <Clock className="w-4 h-4 ml-3 mr-1" />
                <span>{anime.episodes || 'N/A'} ep</span>
              </div>
              <div className="flex items-center text-sm mb-2">
                <Radio className={`w-4 h-4 mr-1 ${getStatusColor(anime.status)}`} />
                <span className={getStatusColor(anime.status)}>
                  {anime.status === 'RELEASING' ? 'Airing' : 
                   anime.status === 'FINISHED' ? 'Finished' : 
                   anime.status === 'NOT_YET_RELEASED' ? 'Upcoming' : 
                   anime.status === 'CANCELLED' ? 'Cancelled' : 'Unknown'}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{anime.description}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

