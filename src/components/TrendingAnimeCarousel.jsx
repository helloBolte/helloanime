'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AnimeCarousel() {
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch anime data from your crousel API
  const fetchTrendingAnime = useCallback(async () => {
    try {
      const response = await fetch('/api/crousel');
      if (!response.ok) {
        throw new Error(`Crousel API responded with status: ${response.status}`);
      }
      const data = await response.json();
      setTrendingAnime(data);
    } catch (error) {
      console.error('Error fetching crousel data:', error);
      setError(error.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Slide navigation functions
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % trendingAnime.length);
  }, [trendingAnime.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? trendingAnime.length - 1 : prevIndex - 1
    );
  }, [trendingAnime.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchTrendingAnime();
  }, [fetchTrendingAnime]);

  // Auto-slide interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [nextSlide]);

  // Strip HTML tags from description
  function stripHtmlTags(str) {
    if (!str) return '';
    return str.replace(/<[^>]+>/g, '');
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-[280px] md:h-[480px] bg-gray-900 rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-[280px] md:h-[480px] bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-white text-xl">Error: {error}</p>
      </div>
    );
  }

  // No data state
  if (trendingAnime.length === 0) {
    return (
      <div className="w-full h-[280px] md:h-[480px] bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-white text-xl">No trending anime available at the moment.</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="relative w-full h-[280px] md:h-[480px] bg-gray-900 rounded-lg overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          variants={{
            enter: { x: 300, opacity: 0 },
            center: { x: 0, opacity: 1 },
            exit: { x: -300, opacity: 0 },
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="absolute w-full h-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(event, info) => {
            const offset = info.offset.x;
            if (offset < -50) {
              // Swiped left to see next slide
              nextSlide();
            } else if (offset > 50) {
              // Swiped right to see previous slide
              prevSlide();
            }
          }}
        >
          {trendingAnime[currentIndex] && (
            <>
              {/* Background Image for Mobile (Cover Image) */}
              <div
                className="md:hidden absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    trendingAnime[currentIndex].coverImage.extraLarge ||
                    trendingAnime[currentIndex].coverImage.large
                  })`,
                }}
              />
              {/* Background Image for Desktop (Banner Image) */}
              <div
                className="hidden md:block absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    trendingAnime[currentIndex].bannerImage ||
                    trendingAnime[currentIndex].coverImage.extraLarge ||
                    trendingAnime[currentIndex].coverImage.large
                  })`,
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end px-4 md:px-10 pt-4 md:pt-10 pb-2 md:pb-4 text-white">
                <div className="w-full md:w-2/3 lg:w-1/2">
                  <Badge className="mb-1 md:mb-2 bg-purple-600 text-white text-xs md:text-sm">
                    #{currentIndex + 1} Spotlight
                  </Badge>
                  <h2 className="text-xl md:text-4xl font-bold mb-1 md:mb-2 line-clamp-2">
                    {trendingAnime[currentIndex].title.english ||
                      trendingAnime[currentIndex].title.romaji}
                  </h2>
                  {/* Hide description on very small screens */}
                  <p className="hidden sm:block text-sm md:text-base text-gray-300 mb-2 md:mb-4 line-clamp-2">
                    {stripHtmlTags(trendingAnime[currentIndex].description).substring(0, 100)}...
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2 md:mb-4">
                    {(trendingAnime[currentIndex].genres || []).slice(0, 2).map((genre, index) => (
                      <Badge key={index} className="bg-gray-800/60 text-gray-200 text-xs md:text-sm">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-4 mb-2 md:mb-4">
                    <div className="flex items-center text-xs md:text-base">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{(trendingAnime[currentIndex].averageScore / 10).toFixed(1)}</span>
                    </div>
                    <Badge className="text-green-400 border-green-400 bg-black/30 text-xs md:text-sm">
                      {trendingAnime[currentIndex].status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Buttons positioned at bottom right */}
              <div className="absolute bottom-1 md:bottom-2 right-4 md:right-6 flex flex-col md:flex-row items-end md:items-center space-y-2 md:space-y-0 md:space-x-4 z-20">
                <Link href={`/anime/${trendingAnime[currentIndex].id}`}>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white w-28 md:w-auto text-sm md:text-base">
                    Watch Now
                  </Button>
                </Link>
                {/* Hide "Details" button on mobile */}
                <Link href={`/anime/${trendingAnime[currentIndex].id}/details`} className="hidden md:block">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white w-28 md:w-auto text-sm md:text-base">
                    Details
                  </Button>
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots moved to top right */}
      <div className="absolute top-4 md:top-6 right-4 md:right-6 flex space-x-2 z-20">
        {trendingAnime.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white scale-110' : 'bg-gray-500 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
