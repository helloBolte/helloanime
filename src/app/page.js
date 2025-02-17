import TrendingAnimeCarousel from '@/components/TrendingAnimeCarousel';
import GenreSelector from '@/components/GenreSelector'; // Corrected spelling if needed
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import AnimeGrid from "@/components/animegrid"; // Remove curly braces
import TopAiring from "@/components/topairing";  // Remove curly braces
import { SWRConfig } from "swr";

export default function Home() {
  const client = new ApolloClient({
    uri: "https://graphql.anilist.co",
    cache: new InMemoryCache(),
  });

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      <div className="min-h-screen bg-black text-white">
        <main className="container mx-auto px-1 py-2">
          <TrendingAnimeCarousel />
          <div className="w-full h-6 bg-transparent"></div>
          <GenreSelector />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
            <AnimeGrid />
            </div>
            <div className="space-y-8">
              <TopAiring />
            </div>
          </div>
        </main>
        <footer className="bg-gray-900 text-white py-6">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2023 HelloAnime. All rights reserved.</p>
          </div>
        </footer>
      </div>
      </SWRConfig>
  );
}
