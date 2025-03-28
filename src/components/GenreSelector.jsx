"use client";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const genres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

export default function GenreSelector() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    checkScrollPosition();

    const scrollElement = scrollRef.current;
    scrollElement.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      scrollElement.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []);

  return (
    <div className="relative flex items-center w-full overflow-hidden px-4">
      {/* Left fade overlay */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 h-full w-52 pointer-events-none bg-gradient-to-r from-black to-transparent z-10" />
      )}

      {/* Left arrow button */}
      {canScrollLeft && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className="absolute left-0 z-20 rounded-full m-2 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}

      {/* Scrollable genre list */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar"
      >
        {genres.map((genre) => (
          <Link href={`/genre/${genre}`} key={genre}>
          <button
            key={genre}
            className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-purple-600 hover:text-white text-sm transition-colors"
          >
            {genre}
          </button>
          </Link>
        ))}
      </div>

      {/* Right arrow button */}
      {canScrollRight && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="absolute right-0 z-20 rounded-full m-2 bg-purple-600 hover:bg-purple-700 text-white shadow-md"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}

      {/* Right fade overlay */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 h-full w-52 pointer-events-none bg-gradient-to-l from-black to-transparent z-10" />
      )}
    </div>
  );
}
