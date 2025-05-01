"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useDebounce } from "use-debounce"
import Link from "next/link"
import { Search, X, Home, TrendingUp, Calendar, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Logo from "@/components/logo"
import { cn } from "@/lib/utils"

const ANILIST_API = "https://graphql.anilist.co"

export default function Navbar() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [debouncedQuery] = useDebounce(query, 500)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  const lastScrollY = useRef(0)
  const router = useRouter()
  const suggestionRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setIsScrolled(currentY > 10)
      setIsHidden(currentY > lastScrollY.current && currentY > 50)
      lastScrollY.current = currentY
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length > 2) {
        setIsLoading(true)
        try {
          const data = await fetchAniListData(debouncedQuery)
          setSuggestions(data)
        } catch (error) {
          console.error("Error fetching suggestions:", error)
          setSuggestions([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSuggestions([])
        setIsLoading(false)
      }
    }
    fetchSuggestions()
  }, [debouncedQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setQuery("")
      setSuggestions([])
      setIsMenuOpen(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery("")
    setSuggestions([])
    setIsMenuOpen(false)
    router.push(`/anime/${suggestion.id}`)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-300",
        isHidden ? "-translate-y-full" : "translate-y-0",
        isScrolled
          ? "bg-black/50 backdrop-blur-lg shadow-xl border-b border-white/10"
          : "bg-transparent backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center group">
            <div className="relative w-10 h-10 md:w-16 md:h-16 mr-2 overflow-hidden">
              <Logo className="text-pink-500" />
            </div>
            <div className="relative h-6 w-20 md:h-32 md:w-32 ml-2">
              <img
                src="/title.png"
                alt="title"
                className="object-contain w-full h-full filter brightness-125"
              />
            </div>
          </Link>

          <div className="hidden md:flex ml-8 space-x-2">
            <NavLink href="/" icon={<Home size={16} />} label="Home" />
            <NavLink href="/trending" icon={<TrendingUp size={16} />} label="Trending" />
            <NavLink href="/schedule" icon={<Calendar size={16} />} label="Schedule" />
            <NavLink href="/history" icon={<Clock size={16} />} label="History" />
          </div>

          <div className="flex items-center">
            <div className="hidden md:block md:w-64 lg:w-96 mr-4">
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
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-pink-400/80 hover:text-pink-300 hover:bg-white/5"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {isMenuOpen ? <X size={24} /> : <Search size={24} />}
              </Button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 animate-in slide-in-from-top duration-300">
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
        )}
      </div>
    </nav>
  )
}

function NavLink({ href, label, icon }) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
    >
      {icon && <span className="mr-2 text-pink-400/80 group-hover:text-pink-300">{icon}</span>}
      <span className="relative">
        {label}
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-pink-500 transition-all duration-300 group-hover:w-full" />
      </span>
    </Link>
  )
}

function SearchForm({
  query,
  setQuery,
  handleSearch,
  suggestions,
  handleSuggestionClick,
  suggestionRef,
  searchRef,
  isLoading,
}) {
  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anime..."
          className="w-full pr-10 bg-black/40 text-white border border-white/20 focus:border-pink-400/80 focus:ring-2 focus:ring-pink-500/30 rounded-lg placeholder:text-gray-400 shadow-xl"
        />
        <Button
          type="submit"
          className="absolute right-1 top-1 bottom-1 bg-pink-600/90 hover:bg-pink-500/90 text-white px-3 rounded-lg transition-all shadow-[0_4px_14px_0_rgba(236,72,153,0.3)]"
        >
          <Search size={18} />
        </Button>
      </form>

      {(suggestions.length > 0 || isLoading) && (
        <div
          ref={suggestionRef}
          className="absolute z-40 w-full mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl max-h-[60vh] overflow-y-auto animate-in fade-in-50 duration-150"
        >
          {isLoading ? (
            [...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center p-3 border-b border-white/5 last:border-0">
                <Skeleton className="w-12 h-16 mr-3 bg-gray-800/50" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2 bg-gray-800/50" />
                  <Skeleton className="h-3 w-1/2 bg-gray-800/50" />
                </div>
              </div>
            ))
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                className="w-full text-left flex items-center p-3 hover:bg-white/5 border-b border-white/5 last:border-0 cursor-pointer text-white transition-colors group"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="w-12 h-16 mr-3 overflow-hidden rounded-md relative shadow-lg">
                  <img
                    src={suggestion.coverImage.medium}
                    alt={suggestion.title.romaji}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-pink-100 group-hover:text-pink-300 transition-colors">
                    {suggestion.title.english || suggestion.title.romaji}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {suggestion.title.english && suggestion.title.english !== suggestion.title.romaji
                      ? suggestion.title.romaji
                      : "Anime"}
                  </p>
                </div>
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
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
  `

  const response = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: searchQuery,
      variables: { search: query },
    }),
  })

  const data = await response.json()
  return data.data.Page.media
}