'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, Search, X, Radio } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/logo';

const ANILIST_API = 'https://graphql.anilist.co';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedQuery] = useDebounce(query, 500);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const suggestionRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length > 2) {
        setIsLoading(true);
        try {
          const data = await fetchAniListData(debouncedQuery);
          setSuggestions(data);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsMenuOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery('');
    setSuggestions([]);
    setIsMenuOpen(false);
    router.push(`/anime/${suggestion.id}`);
  };

  return (
    <nav className="bg-gray-800 px-4 sm:px-6 lg:px-8 overflow-visible">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center hover:text-purple-300 transition-colors">
          <Logo />
        </Link>
        <div className="flex items-center">
          <div className="hidden sm:block sm:w-64 lg:w-96 mr-4">
            <SearchForm 
              query={query} 
              setQuery={setQuery} 
              handleSearch={handleSearch} 
              suggestions={suggestions} 
              handleSuggestionClick={handleSuggestionClick} 
              suggestionRef={suggestionRef} 
              searchRef={searchRef} 
              isLoading={isLoading} 
            />
          </div>
          <Button variant="secondary" className="hidden sm:block bg-purple-600 text-white hover:bg-purple-700">
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
}

function SearchForm({ query, setQuery, handleSearch, suggestions, handleSuggestionClick, suggestionRef, searchRef, isLoading }) {
  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <Input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search for anime..." 
          className="w-full pr-10 bg-gray-800 text-white border border-purple-600 rounded-md"
        />
        <Button type="submit" className="absolute right-0 top-0 bottom-0 bg-purple-600 text-white px-3 rounded-r-md">
          <Search size={20} />
        </Button>
      </form>
      {(suggestions.length > 0 || isLoading) && (
        <div ref={suggestionRef} className="absolute z-40 w-full mt-1 bg-gray-800 border border-purple-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            [...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center p-2">
                <Skeleton className="w-10 h-14 mr-2" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            suggestions.map((suggestion) => (
              <button key={suggestion.id} className="w-full text-left flex items-center p-2 hover:bg-gray-700 cursor-pointer text-white" onClick={() => handleSuggestionClick(suggestion)}>
                <img src={suggestion.coverImage.medium || '/placeholder.svg'} alt={suggestion.title.romaji} className="w-10 h-14 object-cover mr-2" />
                <div className="flex-1">
                  <span className="line-clamp-1">{suggestion?.title?.english || suggestion?.title?.romaji}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

async function fetchAniListData(query) {
  const searchQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
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
        }
      }
    }
  `;

  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: searchQuery,
      variables: { search: query },
    }),
  });

  const data = await response.json();
  return data.data.Page.media;
}
