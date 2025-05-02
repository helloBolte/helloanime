'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Info,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function TrendingAnimeCarousel() {
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trailerLoaded, setTrailerLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef(null);

  const fetchTrendingAnime = useCallback(async () => {
    try {
      const res = await fetch('/api/crousel');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setTrendingAnime(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load trending anime');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingAnime();
  }, [fetchTrendingAnime]);

  const handleNavigation = (direction) => {
    setTrailerLoaded(false);
    setCurrentIndex((prev) =>
      (prev + direction + trendingAnime.length) % trendingAnime.length
    );
  };

  const toggleMute = () => {
    if (!iframeRef.current) return;
    const iframeWindow = iframeRef.current.contentWindow;
    if (iframeWindow) {
      iframeWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: isMuted ? 'unMute' : 'mute',
          args: [],
        }),
        '*'
      );
      setIsMuted((prev) => !prev);
    }
  };

  if (loading) {
    return (
      <Skeleton className="w-full h-[280px] md:h-[480px] rounded-xl bg-gray-800/50" />
    );
  }

  if (error) {
    return (
      <div className="w-full h-[280px] md:h-[480px] bg-gray-900/50 flex items-center justify-center text-pink-200 rounded-xl border border-white/10">
        {error}
      </div>
    );
  }

  if (!trendingAnime.length) {
    return (
      <div className="w-full h-[280px] md:h-[480px] bg-gray-900/50 flex items-center justify-center text-pink-200 rounded-xl border border-white/10">
        No trending anime available
      </div>
    );
  }

  const currentAnime = trendingAnime[currentIndex];
  const imageUrl =
    currentAnime?.bannerImage || currentAnime?.coverImage?.large ||
    '/placeholder.svg';
  const trailerId = currentAnime?.trailer?.id;

  return (
    <div className="relative w-full h-[280px] md:h-[480px] rounded-xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(236,72,153,0.1)] group">
      {/* Navigation Arrows */}
      <button
        onClick={() => handleNavigation(-1)}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 rounded-full"
      >
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
      </button>
      <button
        onClick={() => handleNavigation(1)}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 rounded-full"
      >
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
      </button>

      {/* Mute Toggle */}
      {trailerLoaded && (
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 z-30 p-2 bg-black/30 rounded-full"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-pink-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-pink-400" />
          )}
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-full w-full"
        >
          {/* Media Container */}
          <div className="relative w-full h-full">
            {/* Preview Image */}
            <img
              src={imageUrl}
              alt="Anime banner"
              className={`w-full h-full object-cover ${
                trailerLoaded ? 'opacity-0' : 'opacity-100'
              } transition-opacity duration-500`}
              loading="eager"
              onError={(e) => ((e.target).src = '/placeholder.svg')}
            />

            {/* YouTube Trailer */}
            {trailerId && (
              <iframe
                ref={iframeRef}
                className={`absolute inset-0 w-full h-full object-cover ${
                  trailerLoaded ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-500`}
                src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&enablejsapi=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&autohide=1&fs=0`}
                allow="accelerometer; autoplay; encrypted-media; gyroscope"
                allowFullScreen
                onLoad={() => setTrailerLoaded(true)}
              />
            )}
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 p-4 md:p-6 lg:p-8 text-white text-left">
            <div className="max-w-lg space-y-2 md:space-y-4">
              {/* Badge hidden on mobile */}
              <Badge className="inline-block bg-pink-600/90 text-white w-fit">
                <span className="mr-2">⭐</span> #{currentIndex + 1} Spotlight
              </Badge>

              <h1 className="font-bold text-xl md:text-3xl line-clamp-2">
                {currentAnime.title?.english || currentAnime.title?.romaji}
              </h1>

              {/* Description hidden on mobile */}
              <p
                className="hidden md:block text-pink-100/90 text-sm md:line-clamp-3"
              >
                <style>
                  display: hidden;
                </style>
                {currentAnime.description?.replace(/<[^>]+>/g, '')}
              </p>

              {/* Buttons container aligned left */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
  <Link href={`/watch/${currentAnime.id}`} className="md:w-auto">
    <Button className="w-full md:w-auto bg-pink-600 hover:bg-pink-500 text-white">
      <Play className="h-4 w-4 mr-2" />
      Watch Now
    </Button>
  </Link>
  <Link href={`/anime/${currentAnime.id}`} className="hidden md:inline-block">
    <Button
      variant="outline"
      className="border-white/20 text-white bg-transparent hover:bg-white/10 hover:text-pink-400"
    >
      <Info className="h-4 w-4 mr-2" />
      Details
    </Button>
  </Link>
</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
