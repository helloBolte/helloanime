"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ArtPlayer from "artplayer";
import Hls from "hls.js";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchPage() {
  const params = useParams();
  const { anilistId } = params;
  const router = useRouter();

  const [player, setPlayer] = useState(null);
  const [directoryName, setDirectoryName] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [videoSource, setVideoSource] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDub, setIsDub] = useState(false); // Toggle between dub and sub

  // For quality selection
  const [qualityLevels, setQualityLevels] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(-1); // -1 = Auto
  const hlsRef = useRef(null);

  // Fetch anime details on mount
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

  // Initialize or reinitialize ArtPlayer (and Hls) when videoSource or isDub changes
  useEffect(() => {
    if (typeof window === "undefined" || !videoSource) return;

    // Destroy any existing player instance
    if (player) {
      player.destroy();
      setPlayer(null);
    }

    const url = isDub ? videoSource.dub?.m3u8 : videoSource.sub?.m3u8;
    const subtitleUrl = isDub ? videoSource.dub?.subtitle : videoSource.sub?.subtitle;

    if (!url) {
      console.error("Video URL not available");
      return;
    }

    // Clear previous quality levels
    setQualityLevels([]);
    setSelectedQuality(-1);

    // Always supply subtitle as an object (empty if no subtitleUrl)
    const artOptions = {
      container: "#player",
      url,
      subtitle: subtitleUrl
        ? {
            url: subtitleUrl,
            type: "vtt",
            style: { color: "#FFF", fontSize: "20px" },
          }
        : {},
      playbackRate: true,
      setting: true,
      fullscreen: true,
      theme: "#8b5cf6",
    };

    const newPlayer = new ArtPlayer(artOptions);

    // Add subtitle toggle control if subtitle exists by manually inserting the button
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

      // Wait briefly for the control bar to render, then append the button
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

    // If the URL is an HLS stream, initialize Hls for quality selection
    if (url.includes("m3u8") && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(newPlayer.video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log("Manifest parsed:", data);
        setQualityLevels(data.levels);
        // Auto-play the video once manifest is parsed
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

  // Automatically load the first episode if none is selected
  useEffect(() => {
    if (episodes.length > 0 && !currentEpisode) {
      handleEpisodeSelect(episodes[0]);
    }
  }, [episodes]);

  // Handle episode selection
  const handleEpisodeSelect = async (episode) => {
    try {
      setCurrentEpisode(episode);
      const res = await fetch(
        `/api/episodes?directory_name=${directoryName}&ep_id=${episode.ep_id}`
      );
      const data = await res.json();
      setVideoSource(data); // Contains both sub and dub sources

      // Reset quality levels when switching episodes
      setQualityLevels([]);
      setSelectedQuality(-1);
    } catch (error) {
      console.error("Error loading episode:", error);
    }
  };

  // Toggle between dub and sub
  const toggleDubSub = () => {
    setIsDub(!isDub);
  };

  // Handle quality change from the dropdown
  const handleQualityChange = (e) => {
    const selected = parseInt(e.target.value);
    setSelectedQuality(selected);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = selected;
    }
  };

  // Filter and paginate episodes
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
        {/* Video Player Container or Skeleton Loading */}
        {videoSource ? (
          <div
            id="player"
            className="bg-gray-900 rounded-lg overflow-hidden aspect-video mb-8"
          ></div>
        ) : (
          <Skeleton className="h-[400px] w-full rounded-lg mb-8" />
        )}

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-purple-400">
            {router.searchParams?.get("title") || "Anime Title"}
          </h1>

          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={toggleDubSub}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              {isDub ? "Switch to Sub" : "Switch to Dub"}
            </button>

            <input
              type="text"
              placeholder="Search episodes..."
              className="bg-gray-800 text-white px-4 py-2 rounded-lg w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Quality Selector appears only when quality levels are available */}
            {qualityLevels.length > 0 && (
              <select
                value={selectedQuality}
                onChange={handleQualityChange}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                <option value={-1}>Auto (Best)</option>
                {qualityLevels.map((level, index) => (
                  <option key={index} value={index}>
                    {level.height}p - {Math.round(level.bitrate / 1000)} Mbps
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-4 mb-8">
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

        {!videoSource && (
          <div className="text-center text-gray-400">
            Loading video source...
          </div>
        )}

        {videoSource &&
          !(isDub ? videoSource.dub?.m3u8 : videoSource.sub?.m3u8) && (
            <div className="text-center text-red-400">
              Video source not available
            </div>
          )}
      </div>
    </div>
  );
}
