"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import ArtPlayer from "artplayer";
import Hls from "hls.js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- Round Robin Helper for Pahe Endpoints ---
const paheEndpoints = ["/api/gpahe", "/api/gpahe2", "/api/gpahe3"];
let paheEndpointIndex = 0;
function getNextPaheEndpoint() {
  const endpoint = paheEndpoints[paheEndpointIndex];
  paheEndpointIndex = (paheEndpointIndex + 1) % paheEndpoints.length;
  return endpoint;
}
// --- End Round Robin Helper ---

// Helper: Proxy image URL via /api/gimg if necessary.
const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("https://img.gojo.wtf/")) {
    return `/api/gimg?url=${encodeURIComponent(url)}`;
  }
  return url;
};

// Enhanced cookie helpers
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function setCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/`;
}

/**
 * Adds timeline markers for the intro and outro segments.
 */
function addIntroOutroMarkers(art, skipData) {
  const duration = art.video.duration;
  const timeline = art.container.querySelector(".artplayer-timeline");
  if (!timeline || !duration) return;
  // Clear any existing markers.
  timeline.querySelectorAll(".skip-marker").forEach((el) => el.remove());
  // Intro marker.
  if (skipData.op && skipData.op.startTime > 0) {
    const introMarker = document.createElement("div");
    introMarker.className = "skip-marker skip-intro";
    const widthPercent = (skipData.op.startTime / duration) * 100;
    introMarker.style.position = "absolute";
    introMarker.style.left = "0%";
    introMarker.style.width = widthPercent + "%";
    introMarker.style.height = "100%";
    introMarker.style.backgroundColor = "rgba(255,255,0,0.3)";
    timeline.appendChild(introMarker);
  }
  // Outro marker.
  if (skipData.ed && skipData.ed.endTime < duration) {
    const outroMarker = document.createElement("div");
    outroMarker.className = "skip-marker skip-outro";
    const leftPercent = (skipData.ed.endTime / duration) * 100;
    const widthPercent = ((duration - skipData.ed.endTime) / duration) * 100;
    outroMarker.style.position = "absolute";
    outroMarker.style.left = leftPercent + "%";
    outroMarker.style.width = widthPercent + "%";
    outroMarker.style.height = "100%";
    outroMarker.style.backgroundColor = "rgba(0,255,255,0.3)";
    timeline.appendChild(outroMarker);
  }
}

export default function WatchPage() {
  const { anilistId } = useParams();
  const cookieKey = `watchSettings_${anilistId}`;

  // Read cookie synchronously during initialization.
  const initialWatchSettings = (() => {
    if (typeof document !== "undefined") {
      const cookieVal = getCookie(cookieKey);
      if (cookieVal) {
        try {
          return JSON.parse(decodeURIComponent(cookieVal));
        } catch (error) {
          console.error("Error parsing watchSettings cookie:", error);
        }
      }
    }
    return {
      thumbnailUrl: "",
      animeTitle: ""
    };
  })();

  // State for anime name (initialize from cookie if available)
  const [animeName, setAnimeName] = useState(initialWatchSettings.animeTitle || "");

  // Watch settings and audio track (initialized from cookie if available).
  const [watchSettings, setWatchSettings] = useState(initialWatchSettings);
  const [audioTrack, setAudioTrack] = useState(initialWatchSettings?.audio || "sub");

  // Providers, episodes and current selections.
  const [providers, setProviders] = useState([]);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [episodeDetails, setEpisodeDetails] = useState(null);

  // UI states.
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 100;

  // Refs for ArtPlayer.
  const playerContainerRef = useRef(null);
  const artPlayerRef = useRef(null);

  // Fetch anime name from AniList only if not in cookie
  useEffect(() => {
    if (!anilistId || initialWatchSettings.animeTitle) return;
    
    axios
      .post("https://graphql.anilist.co", {
        query: `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              title {
                romaji
                english
                native
              }
            }
          }
        `,
        variables: { id: parseInt(anilistId, 10) },
      })
      .then((res) => {
        const media = res.data.data.Media;
        const title =
          media.title.romaji || media.title.english || media.title.native;
        setAnimeName(title);
      })
      .catch((err) => {
        console.error("Error fetching anime info from AniList:", err);
      });
  }, [anilistId, initialWatchSettings.animeTitle]);

  // Read cookie on initial load (in case it changes).
  useEffect(() => {
    if (!anilistId) return;
    const cookieVal = getCookie(cookieKey);
    if (cookieVal) {
      try {
        const settings = JSON.parse(decodeURIComponent(cookieVal));
        setWatchSettings(settings);
        if (settings.animeTitle) {
          setAnimeName(settings.animeTitle);
        }
      } catch (error) {
        console.error("Error parsing watchSettings cookie:", error);
      }
    }
  }, [anilistId, cookieKey]);

  // Fetch providers from /api/gepisodes and filter to only use "strix" and "zaza".
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/gepisodes?id=${anilistId}`);
        const data = res.data;
        const filteredData = data.filter(
          (p) => p.providerId === "strix" || p.providerId === "zaza"
        );
        if (filteredData && filteredData.length > 0) {
          setProviders(filteredData);
          const savedProviderId = watchSettings?.provider;
          const defaultProvider =
            filteredData.find((p) => p.providerId === savedProviderId) ||
            filteredData.find((p) => p.providerId === "strix") ||
            filteredData.find((p) => p.providerId === "zaza");
          setCurrentProvider(defaultProvider);
          setAudioTrack(watchSettings?.audio || "sub");
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
      } finally {
        setLoading(false);
      }
    }
    if (anilistId) fetchData();
  }, [anilistId, watchSettings]);

  // Update episodes list when provider or audio track changes.
  useEffect(() => {
    if (!currentProvider) return;
    let filtered = [...(currentProvider.episodes || [])];
    
    if (audioTrack === "dub") {
      filtered = filtered.filter((ep) => ep.hasDub === true);
    }

    setEpisodes(filtered);
    setCurrentPage(1);

    if (filtered.length > 0) {
      // Try to maintain current episode number
      const currentEpNumber = currentEpisode?.number;
      const targetEpisode = filtered.find(ep => ep.number === currentEpNumber) || 
                           filtered.find(ep => ep.number === watchSettings?.episode) || 
                           filtered[0];
      
      setCurrentEpisode(targetEpisode);
    } else {
      setCurrentEpisode(null);
    }
  }, [currentProvider, audioTrack, watchSettings]);

  // Fetch episode details from /api/gwatch.
  useEffect(() => {
    async function fetchEpisodeDetails() {
      if (!currentEpisode || !currentProvider) return;
      let watchId = "";
      let dub_id = "";
      if (currentProvider.providerId === "zaza") {
        watchId = currentEpisode.id;
        dub_id = currentEpisode.dub_id || "null";
      } else {
        watchId = currentEpisode.number;
        dub_id = "null";
      }
      const url = `/api/gwatch?provider=${currentProvider.providerId}&id=${anilistId}&num=${currentEpisode.number}&subType=${audioTrack}&watchId=${watchId}&dub_id=${dub_id}`;
      try {
        const res = await axios.get(url);
        setEpisodeDetails(res.data);
      } catch (error) {
        console.error("Error fetching episode details from gwatch API:", error.message);
      }
    }
    fetchEpisodeDetails();
  }, [currentEpisode, audioTrack, currentProvider, anilistId]);

  // Immediately destroy the current player when audio track changes.
  useEffect(() => {
    if (artPlayerRef.current) {
      artPlayerRef.current.destroy();
      artPlayerRef.current = null;
    }
  }, [audioTrack]);

  // Initialize ArtPlayer.
  useEffect(() => {
    if (!playerContainerRef.current) return;
    if (artPlayerRef.current) {
      artPlayerRef.current.destroy();
      artPlayerRef.current = null;
    }
    if (
      !currentEpisode ||
      !episodeDetails ||
      (Object.keys(episodeDetails).length === 0) ||
      !episodeDetails.sources ||
      episodeDetails.sources.length === 0
    ) {
      return;
    }
    let rawVideoUrl = "";
    const artConfig = {
      container: playerContainerRef.current,
      poster: getImageUrl(currentEpisode.image),
      cover: getImageUrl(currentEpisode.image),
      autoSize: false,
      width: "100%",
      height: "200px sm:h-[300px] md:h-[400px]",
      volume: 0.5,
      fullscreen: true,
      flip: true,
      rotate: true,
      playbackRate: true,
      aspectRatio: false,
      setting: true,
      theme: "#c026d3",
      crossOrigin: "anonymous",
      autoplay: true,
      plugins: [],
    };
    if (currentProvider?.providerId === "zaza") {
      rawVideoUrl = `/api/gzaza?url=${encodeURIComponent(episodeDetails.sources[0].url)}`;
      artConfig.type = "m3u8";
      artConfig.customType = {
        m3u8: (video, url) => {
          class CustomLoader extends Hls.DefaultConfig.loader {
            load(context, config, callbacks) {
              if (context.url && !context.url.startsWith("/api/gzaza?url=")) {
                context.url = `/api/gzaza?url=${encodeURIComponent(context.url)}`;
              }
              super.load(context, config, callbacks);
            }
          }
          const hls = new Hls({ loader: CustomLoader });
          hls.loadSource(url);
          hls.attachMedia(video);
          return hls;
        },
      };
      if (episodeDetails.skips) {
        artConfig.plugins.push((art) => {
          art.on("loadedmetadata", () => {
            addIntroOutroMarkers(art, episodeDetails.skips);
          });
          return () => {};
        });
      }
    } else if (currentProvider?.providerId === "strix") {
      rawVideoUrl = episodeDetails.sources[0].url;
      if (episodeDetails.skips) {
        artConfig.plugins.push((art) => {
          art.on("loadedmetadata", () => {
            addIntroOutroMarkers(art, episodeDetails.skips);
          });
          return () => {};
        });
      }
    } else {
      rawVideoUrl = episodeDetails.sources[0].url;
    }
    artConfig.url = rawVideoUrl;
    const art = new ArtPlayer(artConfig);
    artPlayerRef.current = art;
    art.on("loadedmetadata", () => {
      console.log("ArtPlayer loaded metadata");
    });
    art.on("error", (error) => {
      console.error("ArtPlayer error:", error);
    });
    return () => {
      if (artPlayerRef.current) {
        artPlayerRef.current.destroy();
        artPlayerRef.current = null;
      }
    };
  }, [currentEpisode, episodeDetails, currentProvider]);

  // Update cookie when provider, episode, or audio changes.
  useEffect(() => {
    if (!currentProvider || !currentEpisode) return;
    const settings = {
      provider: currentProvider.providerId,
      episode: currentEpisode.number,
      audio: audioTrack,
      thumbnailUrl: currentEpisode.image,
      animeTitle: animeName
    };
    setCookie(cookieKey, settings);
  }, [currentProvider, currentEpisode, audioTrack, cookieKey, animeName]);

  const isEpisodeUnavailable =
    episodeDetails && Object.keys(episodeDetails).length === 0;
  const filteredEpisodes = episodes.filter((ep) => {
    const query = searchQuery.toLowerCase();
    return (
      ep.number.toString().includes(query) ||
      (ep.description && ep.description.toLowerCase().includes(query))
    );
  });
  const startIndex = (currentPage - 1) * episodesPerPage;
  const paginatedEpisodes = filteredEpisodes.slice(
    startIndex,
    startIndex + episodesPerPage
  );

  const handleEpisodeSelect = (episode) => setCurrentEpisode(episode);
  const handleProviderSelect = (provider) => {
    setCurrentProvider(provider);
    setAudioTrack("sub");
  };
  const handleNextPage = () => setCurrentPage((p) => p + 1);
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const hasAnyDub = currentProvider?.episodes?.some((ep) => ep.hasDub === true);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col md:flex-row">
      {/* MAIN CONTENT (Video player and details) */}
      <div className="order-1 md:order-2 flex-1 flex flex-col">
        {/* Anime name shown as a header above the video player */}
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">
            {animeName || "Anime Title"}
          </h1>
          {currentEpisode ? (
            isEpisodeUnavailable ? (
              <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] bg-[#1f1f1f] flex items-center justify-center rounded">
                {`${audioTrack.toUpperCase()} track is not available for this provider. Please change the server.`}
              </div>
            ) : (
              <div
                ref={playerContainerRef}
                className="w-full h-[200px] sm:h-[300px] md:h-[400px] bg-[#1f1f1f] rounded overflow-hidden"
              />
            )
          ) : (
            <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] bg-[#1f1f1f] flex items-center justify-center rounded">
              Select an episode
            </div>
          )}
        </div>
        <div className="bg-[#1f1f1f] p-4">
          {currentEpisode && (
            <div className="mb-3">
              <div className="font-bold text-purple-400">You are Watching</div>
              <div className="text-lg font-semibold">
                Episode {currentEpisode.number}: {currentEpisode.title}
              </div>
              {currentEpisode.isFiller && (
                <span className="inline-block mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded">
                  Filler Episode
                </span>
              )}
            </div>
          )}
          <div className="mb-4">
            <span className="font-bold text-gray-300 mr-2">Audio:</span>
            <button
              onClick={() => setAudioTrack("sub")}
              className={`inline-block px-3 py-1 rounded mr-2 mb-2 transition-colors ${
                audioTrack === "sub"
                  ? "bg-purple-600"
                  : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
              }`}
            >
              SUB
            </button>
            {hasAnyDub && (
              <button
                onClick={() => setAudioTrack("dub")}
                className={`inline-block px-3 py-1 rounded mr-2 mb-2 transition-colors ${
                  audioTrack === "dub"
                    ? "bg-purple-600"
                    : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                }`}
              >
                DUB
              </button>
            )}
            {!hasAnyDub && audioTrack === "dub" && (
              <span className="text-red-400 ml-2">
                No dub episodes available for this provider.
              </span>
            )}
          </div>
          <div className="mb-2">
            <span className="font-bold text-gray-300 mr-2">Servers:</span>
            {providers.map((provider) => (
              <button
                key={provider.providerId}
                onClick={() => handleProviderSelect(provider)}
                className={`inline-block px-3 py-1 rounded mr-2 mb-2 transition-colors ${
                  currentProvider?.providerId === provider.providerId
                    ? "bg-purple-600"
                    : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                }`}
              >
                {provider.providerId === "strix" ? "Server 1" : "Server 2"}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            If the current server or track doesn't work, please try switching.
          </div>
        </div>
      </div>
      {/* EPISODE SELECTOR (Sidebar) */}
      <div className="order-3 md:order-1 w-full md:w-[350px] border-t md:border-t-0 md:border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b md:border-b-0">
          <h2 className="text-xl font-bold mb-2">Up Next</h2>
          <input
            type="text"
            placeholder="Search episodes..."
            className="w-full p-2 rounded bg-[#1f1f1f] text-white outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div
          className="p-4 space-y-2 overflow-y-auto"
          style={{ maxHeight: "400px" }}
        >
          {loading ? (
            <Skeleton className="h-8 w-full" />
          ) : paginatedEpisodes.length > 0 ? (
            paginatedEpisodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => handleEpisodeSelect(ep)}
                className={`flex items-center p-2 rounded transition-colors w-full text-left ${
                  currentEpisode?.id === ep.id
                    ? "bg-purple-700"
                    : "bg-[#1f1f1f] hover:bg-[#2a2a2a]"
                }`}
              >
                {ep.image && (
                  <img
                    src={getImageUrl(ep.image)}
                    alt={`Episode ${ep.number}`}
                    className="w-14 h-14 object-cover rounded mr-2"
                  />
                )}
                <div className="flex-1">
                  <div className="font-semibold">Episode {ep.number}</div>
                  <div className="text-xs text-gray-300">
                    {ep.description?.slice(0, 50) || "No description"}...
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div>No episodes found.</div>
          )}
        </div>
        <div className="p-4 flex justify-between border-t border-gray-800">
          <button
            onClick={handlePrevPage}
            className="flex items-center bg-[#1f1f1f] hover:bg-[#2a2a2a] px-3 py-1 rounded transition-colors"
          >
            <ChevronLeft size={18} className="mr-1" />
            Prev
          </button>
          <button
            onClick={handleNextPage}
            className="flex items-center bg-[#1f1f1f] hover:bg-[#2a2a2a] px-3 py-1 rounded transition-colors"
          >
            Next
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}