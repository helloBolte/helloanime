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
        <main className="container mx-auto px-1 py-2">
          <TrendingAnimeCarousel />
          {/* Spacing */}
          <div className="w-full h-6 bg-transparent"></div>
          {/* New Advertisement Block (Data-aa 2388509) */}
          <div
            id="frame2"
            style={{
              width: "100%",
              height: "100%",
              marginBottom: "1rem",
            }}
          >
            <iframe
              data-aa="2388509"
              src="//acceptable.a-ads.com/2388509"
              style={{
                border: "0px",
                padding: "0",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                backgroundColor: "transparent",
              }}
            ></iframe>
            <a
              style={{
                display: "block",
                textAlign: "right",
                fontSize: "12px",
              }}
              id="preview-link2"
              href="https://aads.com/campaigns/new/?source_id=2388509&source_type=ad_unit&partner=2388509"
            >
              Advertise here
            </a>
          </div>
          {/* Additional spacing */}
          <div className="w-full h-6 bg-transparent"></div>
          <GenreSelector />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-5 items-stretch">
            <div className="lg:col-span-2">
              <AnimeGrid />
            </div>
            <div className="max-h-screen">
              {/* Existing Advertisement Block (Data-aa 2388506) */}
              <div className="h-20 w-30" id="frame3">
                <iframe
                  data-aa="2388506"
                  src="//acceptable.a-ads.com/2388506"
                  className="border border[0px] p-0 w-full h-full overflow-hidden bg-transparent"
                ></iframe>
                <a
                  className="block text-right text[12px]"
                  id="preview-link3"
                  href="https://aads.com/campaigns/new/?source_id=2388506&source_type=ad_unit&partner=2388506"
                >
                  Advertise here
                </a>
              </div>
              <TopAiring />
              {/* Another Advertisement Block (Data-aa 2388508) placed after TopAiring */}
              <div
                id="frame4"
                style={{ width: "100%", height: "100%", marginTop: "1rem" }}
              >
                <iframe
                  data-aa="2388508"
                  src="//acceptable.a-ads.com/2388508"
                  style={{
                    border: "0px",
                    padding: "0",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    backgroundColor: "transparent",
                  }}
                ></iframe>
                <a
                  style={{
                    display: "block",
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                  id="preview-link4"
                  href="https://aads.com/campaigns/new/?source_id=2388508&source_type=ad_unit&partner=2388508"
                >
                  Advertise here
                </a>
              </div>
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
