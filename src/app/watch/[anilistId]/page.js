"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ArtPlayer from "artplayer";
import Hls from "hls.js";
import { Skeleton } from "@/components/ui/skeleton";
import { Sliders, ChevronLeft, ChevronRight } from "lucide-react";

// Cookie helper functions
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function setCookie(name, value, days = 365) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export default function WatchPage() {
  const params = useParams();
  const { anilistId } = params;
  const router = useRouter();

  const [player, setPlayer] = useState(null);
  const [animeTitle, setAnimeTitle] = useState("Anime Title");
  const [directoryName, setDirectoryName] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [videoSource, setVideoSource] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  // isDub: true means dub; false means sub.
  const [isDub, setIsDub] = useState(false);

  // For quality selection; -1 means auto.
  const [qualityLevels, setQualityLevels] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(-1);
  const hlsRef = useRef(null);

  // On mount, read cookies for language and quality preferences.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const videoLangCookie = getCookie("videoLang");
      if (videoLangCookie) {
        setIsDub(videoLangCookie === "dub");
      }
      const videoQualityCookie = getCookie("videoQuality");
      if (videoQualityCookie !== null) {
        const quality = parseInt(videoQualityCookie, 10);
        setSelectedQuality(isNaN(quality) ? -1 : quality);
      }
    }
  }, []);

  // Fetch anime title directly from AniList API using anilistId from URL.
  useEffect(() => {
    async function fetchAnimeTitle() {
      try {
        const res = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: `
              query ($id: Int) {
                Media(id: $id, type: ANIME) {
                  title {
                    english
                    romaji
                    native
                  }
                }
              }
            `,
            variables: { id: parseInt(anilistId) },
          }),
        });
        const json = await res.json();
        const media = json.data?.Media;
        if (media) {
          setAnimeTitle(
            media.title.english ||
              media.title.romaji ||
              media.title.native ||
              "Anime Title"
          );
        }
      } catch (error) {
        console.error("Error fetching anime title:", error);
      }
    }
    if (anilistId) {
      fetchAnimeTitle();
    }
  }, [anilistId]);

  // Fetch additional details (episodes, directoryName) from your backend.
  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/details?anilistId=${anilistId}`);
        const data = await res.json();
        setDirectoryName(data.directory_name);
        setEpisodes(data.episode_data);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    }
    if (anilistId) {
      fetchDetails();
    }
  }, [anilistId]);

  // Once quality levels are loaded, apply the stored quality preference.
  useEffect(() => {
    if (hlsRef.current && qualityLevels.length > 0) {
      if (selectedQuality !== -1 && selectedQuality < qualityLevels.length) {
        hlsRef.current.currentLevel = selectedQuality;
      } else {
        if (selectedQuality !== -1) {
          setSelectedQuality(-1);
          setCookie("videoQuality", -1);
        }
        hlsRef.current.currentLevel = -1;
      }
    }
  }, [qualityLevels, selectedQuality]);

  // Initialize or reinitialize ArtPlayer (and Hls) when videoSource or isDub changes.
  useEffect(() => {
    if (typeof window === "undefined" || !videoSource) return;

    // Destroy any existing player instance.
    if (player) {
      player.destroy();
      setPlayer(null);
    }

    // Choose URL and subtitle based on dub/sub preference.
    const url =
      isDub && videoSource.dub?.m3u8
        ? videoSource.dub.m3u8
        : videoSource.sub?.m3u8;
    const subtitleUrl =
      isDub && videoSource.dub?.subtitle
        ? videoSource.dub.subtitle
        : videoSource.sub?.subtitle;

    if (!url) {
      console.error("Video URL not available");
      return;
    }

    // Clear previous quality levels.
    setQualityLevels([]);

    // Configure ArtPlayer options, including subtitle settings if available.
    const artOptions = {
      container: "#player",
      url,
      subtitle: subtitleUrl
        ? {
            url: subtitleUrl,
            type: "vtt",
            style: { color: "#FFF", fontSize: "20px" },
          }
        : undefined,
      playbackRate: true,
      setting: true,
      fullscreen: true,
      theme: "#8b5cf6",
    };

    // Create new ArtPlayer instance.
    const newPlayer = new ArtPlayer(artOptions);

    // If subtitle is available, create and add a toggle button.
    if (subtitleUrl) {
      const btn = document.createElement("button");
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20"></path>
          <path d="M12 16a4 4 0 0 0 4-4V6"></path>
          <path d="M8 12h8"></path>
        </svg>`;
      btn.title = "Toggle Subtitles";
      btn.className = "artplayer-control-btn";
      btn.addEventListener("click", () => {
        newPlayer.subtitle.toggle();
      });

      // Append the button to the ArtPlayer control bar.
      setTimeout(() => {
        const container = document.getElementById("player");
        const controlBar =
          container.querySelector(".artplayer-controller") ||
          container.querySelector(".artplayer-controls");
        if (controlBar) {
          controlBar.appendChild(btn);
        } else {
          container.appendChild(btn);
        }
      }, 0);
    }

    // Initialize HLS for quality selection if applicable.
    if (url.includes("m3u8") && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(newPlayer.video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log("Manifest parsed:", data);
        setQualityLevels(data.levels);
        newPlayer.video.play();
      });

      hlsRef.current = hls;
    }

    setPlayer(newPlayer);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      newPlayer.destroy();
    };
  }, [videoSource, isDub]);

  // Automatically load the first episode if none is selected.
  useEffect(() => {
    if (episodes.length > 0 && !currentEpisode) {
      handleEpisodeSelect(episodes[0]);
    }
  }, [episodes]);

  // Handle episode selection.
  const handleEpisodeSelect = async (episode) => {
    try {
      setCurrentEpisode(episode);
      const res = await fetch(
        `/api/episodes?directory_name=${directoryName}&ep_id=${episode.ep_id}`
      );
      const data = await res.json();
      setVideoSource(data); // Contains both sub and dub sources.

      // Reset quality levels when switching episodes.
      setQualityLevels([]);
    } catch (error) {
      console.error("Error loading episode:", error);
    }
  };

  // Toggle between dub and sub; also save preference to cookie.
  const toggleDubSub = () => {
    const newIsDub = !isDub;
    setIsDub(newIsDub);
    setCookie("videoLang", newIsDub ? "dub" : "sub");
  };

  // Handle quality change and store preference in cookie.
  const handleQualityChange = (e) => {
    const selected = parseInt(e.target.value, 10);
    setSelectedQuality(isNaN(selected) ? -1 : selected);
    setCookie("videoQuality", isNaN(selected) ? -1 : selected);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = isNaN(selected) ? -1 : selected;
    }
  };

  // Filter and paginate episodes.
  const filteredEpisodes = episodes.filter(
    (ep) =>
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.ep.includes(searchQuery)
  );
  const paginatedEpisodes = filteredEpisodes.slice(
    (currentPage - 1) * 100,
    currentPage * 100
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Video Player Container */}
        {videoSource ? (
          <div className="mb-8">
            <div
              id="player"
              className="bg-gray-900 rounded-lg overflow-hidden aspect-video"
            ></div>
            {qualityLevels.length > 0 && (
              <div className="flex items-center justify-end mt-2">
                <Sliders className="mr-2" size={24} />
                <select
                  value={selectedQuality.toString()}
                  onChange={handleQualityChange}
                  className="bg-gray-800 text-white px-2 py-1 rounded-md focus:outline-none"
                >
                  <option value="-1">Auto (Best)</option>
                  {qualityLevels.map((level, index) => (
                    <option key={index} value={index.toString()}>
                      {level.height}p - {Math.round(level.bitrate / 1000)} Mbps
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <Skeleton className="h-[400px] w-full rounded-lg mb-8" />
        )}

        {/* Header Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-purple-400">{animeTitle}</h1>
          <button
            onClick={toggleDubSub}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg w-full md:w-auto"
          >
            {isDub ? "Switch to Sub" : "Switch to Dub"}
          </button>
        </div>

        {/* Episode Grid with Search and Pagination */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Episodes</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <input
              type="text"
              placeholder="Search episodes..."
              className="bg-gray-800 text-white px-4 py-2 rounded-lg w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-2">
            {paginatedEpisodes.map((episode) => (
              <button
                key={episode.ep_id}
                onClick={() => handleEpisodeSelect(episode)}
                className={`p-2 rounded-lg text-sm ${
                  currentEpisode?.ep_id === episode.ep_id
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                Ep {episode.ep}
              </button>
            ))}
          </div>
        </div>

        {!videoSource && (
          <div className="text-center text-gray-400">
            Loading video source...
          </div>
        )}

        {videoSource &&
          !(isDub
            ? videoSource.dub?.m3u8 || videoSource.sub?.m3u8
            : videoSource.sub?.m3u8) && (
            <div className="text-center text-red-400">
              Video source not available
            </div>
          )}
      </div>
    </div>
  );
}
