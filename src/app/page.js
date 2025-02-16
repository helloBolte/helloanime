import TrendingAnimeCarousel from '@/components/TrendingAnimeCarousel'
import GenreSelector from '@/components/GenereSelector'
export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="container mx-auto px-1 py-2">
        <TrendingAnimeCarousel />
        <div className=' w-full h-6 bg-transparent'></div>
        <GenreSelector/>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* <PopularAnimeGrid />
            <RecentlyUpdated /> */}
          </div>
          <div className="space-y-8">
            {/* <TopAiringAnime />
            <AnimeGenres /> */}
          </div>
        </div>
      </main>
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 HelloAnime. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}