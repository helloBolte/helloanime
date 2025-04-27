import Head from "next/head";
import TrendingAnimeCarousel from '@/components/TrendingAnimeCarousel';
import GenreSelector from '@/components/GenreSelector';
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import AnimeGrid from "@/components/animegrid";
import TopAiring from "@/components/topairing";
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
        <Head>
          <title>HelloAnime - Watch Free Anime Online</title>
          <meta name="description" content="HelloAnime is a free anime streaming site with a huge library of the latest and classic anime shows and movies. Watch your favorite anime online in high quality!" />
          <meta name="keywords" content="free anime streaming, watch anime online, HelloAnime, anime library, top airing anime, trending anime" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta property="og:title" content="HelloAnime - Watch Free Anime Online" />
          <meta property="og:description" content="Stream thousands of anime episodes and movies for free on HelloAnime. Huge collection, no signup required!" />
          <meta property="og:image" content="/helloanime-og-image.jpg" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://yourdomain.com/" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="HelloAnime - Watch Free Anime Online" />
          <meta name="twitter:description" content="Free anime streaming site with huge library. Watch trending and top airing anime on HelloAnime." />
          <meta name="twitter:image" content="/helloanime-og-image.jpg" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="container mx-auto px-1 py-2">
          <TrendingAnimeCarousel />
          {/* Spacing */}
          <div className="w-full h-6 bg-transparent"></div>
          <GenreSelector />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-5 items-stretch">
            <div className="lg:col-span-2">
              <AnimeGrid />
            </div>
            <div className="max-h-screen">
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
