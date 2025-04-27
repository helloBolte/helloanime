"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Head from "next/head";
import axios from "axios";
import ArtPlayer from "artplayer";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Helper: Proxy image URL via /api/gimg if necessary.
const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("https://img.gojo.wtf/")) {
    return `/api/gimg?url=${encodeURIComponent(url)}`;
  }
  return url;
};

// Cookie helpers.
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

export default function WatchPage() {
  const { anilistId } = useParams();
  const cookieKey = `watchSettings_${anilistId}`;

  // Initial settings from cookie
  const initialWatchSettings = (() => {
    if (typeof document === "undefined") return { thumbnailUrl: "", animeTitle: "" };
    const cookieVal = getCookie(cookieKey);
    if (!cookieVal) return { thumbnailUrl: "", animeTitle: "" };
    try {
      return JSON.parse(decodeURIComponent(cookieVal));
    } catch {
      return { thumbnailUrl: "", animeTitle: "" };
    }
  })();

  const [animeName, setAnimeName] = useState(initialWatchSettings.animeTitle || "");
  const [watchSettings, setWatchSettings] = useState(initialWatchSettings);
  const [audioTrack, setAudioTrack] = useState(initialWatchSettings.audio || "sub");
  const [providers, setProviders] = useState([]);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [episodeDetails, setEpisodeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 100;

  const playerContainerRef = useRef(null);
  const artPlayerRef = useRef(null);

  // Fetch anime title if missing
  useEffect(() => {
    if (!anilistId || initialWatchSettings.animeTitle) return;
    axios
      .post("https://graphql.anilist.co", {
        query: `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              title { romaji english native }
            }
          }
        `,
        variables: { id: parseInt(anilistId, 10) },
      })
      .then((res) => {
        const media = res.data.data.Media;
        const title = media.title.romaji || media.title.english || media.title.native;
        setAnimeName(title);
      })
      .catch(console.error);
  }, [anilistId, initialWatchSettings.animeTitle]);

  // Reload cookie settings on mount
  useEffect(() => {
    if (!anilistId) return;
    const cookieVal = getCookie(cookieKey);
    if (!cookieVal) return;
    try {
      const settings = JSON.parse(decodeURIComponent(cookieVal));
      setWatchSettings(settings);
      if (settings.animeTitle) setAnimeName(settings.animeTitle);
    } catch {
      // ignore
    }
  }, [anilistId, cookieKey]);

  // Fetch providers (only “strix”)
  useEffect(() => {
    if (!anilistId) return;
    setLoading(true);
    axios
      .get(`/api/gepisodes?id=${anilistId}`)
      .then((res) => {
        const filtered = res.data.filter((p) => p.providerId === "strix");
        if (filtered.length) {
          setProviders(filtered);
          const saved = filtered.find((p) => p.providerId === watchSettings.provider) || filtered[0];
          setCurrentProvider(saved);
          setAudioTrack(watchSettings.audio || "sub");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [anilistId, watchSettings]);

  // Update episode list when provider or audio changes
  useEffect(() => {
    if (!currentProvider) return;
    let list = currentProvider.episodes || [];
    if (audioTrack === "dub") list = list.filter((ep) => ep.hasDub);
    setEpisodes(list);
    setCurrentPage(1);
    const findByNum = (num) => list.find((e) => e.number === num);
    const target =
      findByNum(currentEpisode?.number) ||
      findByNum(watchSettings.episode) ||
      list[0];
    setCurrentEpisode(target || null);
  }, [currentProvider, audioTrack, watchSettings]);

  // Fetch episode streaming details
  useEffect(() => {
    if (!currentEpisode || !currentProvider) return;
    const url = `/api/gwatch?provider=${currentProvider.providerId}&id=${anilistId}&num=${currentEpisode.number}&subType=${audioTrack}&watchId=${currentEpisode.number}`;
    axios
      .get(url)
      .then((res) => setEpisodeDetails(res.data))
      .catch((err) => console.error("Error fetching episode details:", err));
  }, [currentEpisode, audioTrack, currentProvider, anilistId]);

  // Destroy player when audio changes
  useEffect(() => {
    if (artPlayerRef.current) {
      artPlayerRef.current.destroy();
      artPlayerRef.current = null;
    }
  }, [audioTrack]);

  // Initialize ArtPlayer
  useEffect(() => {
    if (!playerContainerRef.current || !currentEpisode || !episodeDetails?.sources?.length) return;
    if (artPlayerRef.current) {
      artPlayerRef.current.destroy();
      artPlayerRef.current = null;
    }
    const rawUrl = episodeDetails.sources[0].url;
    const art = new ArtPlayer({
      container: playerContainerRef.current,
      url: rawUrl,
      poster: getImageUrl(currentEpisode.image),
      cover: getImageUrl(currentEpisode.image),
      autoSize: false,
      autoHide: false,
      width: "100%",
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
    });
    artPlayerRef.current = art;
    art.on("ready", () => {
      if (art.container.querySelector("#rewind-btn")) return;
      const ctrl = document.createElement("div");
      ctrl.style.cssText = "position:absolute;top:10px;right:10px;z-index:9999;";
      ctrl.innerHTML = `
        <button id="rewind-btn">Rewind 10s</button>
        <button id="forward-btn">Forward 10s</button>
      `;
      art.container.appendChild(ctrl);
      ctrl.querySelector("#rewind-btn").addEventListener("click", () =>
        art.seek(Math.max(0, art.currentTime - 10))
      );
      ctrl.querySelector("#forward-btn").addEventListener("click", () =>
        art.seek(Math.min(art.duration, art.currentTime + 10))
      );
    });
    art.on("error", console.error);
    return () => art.destroy();
  }, [currentEpisode, episodeDetails]);

  // Persist to cookie on change
  useEffect(() => {
    if (!currentProvider || !currentEpisode) return;
    setCookie(cookieKey, {
      provider: currentProvider.providerId,
      episode: currentEpisode.number,
      audio: audioTrack,
      thumbnailUrl: currentEpisode.image,
      animeTitle: animeName,
    });
  }, [currentProvider, currentEpisode, audioTrack, animeName]);

  // Search + pagination
  const filtered = episodes.filter((ep) => {
    const q = searchQuery.toLowerCase();
    return (
      ep.number.toString().includes(q) ||
      ep.description?.toLowerCase().includes(q)
    );
  });
  const startIdx = (currentPage - 1) * episodesPerPage;
  const paginated = filtered.slice(startIdx, startIdx + episodesPerPage);
  const hasAnyDub = currentProvider?.episodes?.some((ep) => ep.hasDub);

  const handleSelectEp = (ep) => setCurrentEpisode(ep);
  const handleNextPage = () => setCurrentPage((p) => p + 1);
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleSelectProv = (prov) => {
    setCurrentProvider(prov);
    setAudioTrack("sub");
  };

  return (
    <>
      <Head>
        <title>
          {animeName}
          {currentEpisode && ` – Episode ${currentEpisode.number}`} | Watch Free
        </title>
        <meta
          name="description"
          content={`Watch ${animeName}${
            currentEpisode ? ` Episode ${currentEpisode.number}` : ""
          } for free online.`}
        />
        <meta
          property="og:title"
          content={`${animeName}${
            currentEpisode ? ` – Episode ${currentEpisode.number}` : ""
          } | Watch Free`}
        />
        <meta
          property="og:description"
          content={`Stream ${animeName}${
            currentEpisode ? ` Episode ${currentEpisode.number}` : ""
          } in high quality for free.`}
        />
        <meta
          property="og:image"
          content={
            currentEpisode?.image ? getImageUrl(currentEpisode.image) : ""
          }
        />
      </Head>

      <div className="min-h-screen bg-[#121212] text-white flex flex-col md:flex-row">
        {/* Video + details */}
        <div className="flex-1 flex flex-col order-1 md:order-2">
          <div className="p-4">
            <h1 className="text-3xl font-bold mb-4">
              {animeName || "Anime Title"}
            </h1>
            {currentEpisode ? (
              !episodeDetails ? (
                <div className="w-full h-[300px] bg-[#1f1f1f] flex items-center justify-center rounded">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div
                  ref={playerContainerRef}
                  className="w-full h-[300px] bg-[#1f1f1f] rounded overflow-hidden"
                />
              )
            ) : (
              <div className="w-full h-[300px] bg-[#1f1f1f] flex items-center justify-center rounded">
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
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-600 rounded">
                    Filler Episode
                  </span>
                )}
              </div>
            )}

            <div className="mb-4">
              <span className="font-bold text-gray-300 mr-2">Audio:</span>
              <button
                onClick={() => setAudioTrack("sub")}
                className={`px-3 py-1 rounded mr-2 ${
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
                  className={`px-3 py-1 rounded mr-2 ${
                    audioTrack === "dub"
                      ? "bg-purple-600"
                      : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                  }`}
                >
                  DUB
                </button>
              )}
              {!hasAnyDub && audioTrack === "dub" && (
                <span className="text-red-400">No dub available.</span>
              )}
            </div>

            <div className="mb-4">
              <span className="font-bold text-gray-300 mr-2">Server:</span>
              {providers.map((prov) => (
                <button
                  key={prov.providerId}
                  onClick={() => handleSelectProv(prov)}
                  className={`px-3 py-1 rounded mr-2 ${
                    currentProvider?.providerId === prov.providerId
                      ? "bg-purple-600"
                      : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
                  }`}
                >
                  Server 1
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-400">
              If this server or track fails, switch options above.
            </div>
          </div>
        </div>

        {/* Episode list */}
        <div className="w-full md:w-[350px] flex flex-col order-3 md:order-1 border-t md:border-t-0 md:border-r border-gray-800">
          <div className="p-4 border-b md:border-b-0">
            <h2 className="text-xl font-bold mb-2">Up Next</h2>
            <input
              type="text"
              placeholder="Search episodes..."
              className="w-full p-2 rounded bg-[#1f1f1f] text-white"
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
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : paginated.length > 0 ? (
              paginated.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => handleSelectEp(ep)}
                  className={`cursor-pointer p-2 rounded ${
                    currentEpisode?.id === ep.id
                      ? "bg-purple-600"
                      : "bg-[#1f1f1f] hover:bg-[#2a2a2a]"
                  }`}
                >
                  <div className="font-semibold">Episode {ep.number}</div>
                  <div className="text-xs text-gray-400 line-clamp-2">
                    {ep.title || ep.description || "No title"}
                  </div>
                  {ep.isFiller && (
                    <div className="text-xs text-red-400 mt-1">Filler</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No episodes found.</div>
            )}
          </div>

          {filtered.length > episodesPerPage && (
            <div className="flex justify-between items-center p-4 border-t border-gray-800">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-[#1f1f1f] hover:bg-[#2a2a2a] disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-400">
                Page {currentPage} / {Math.ceil(filtered.length / episodesPerPage)}
              </span>
              <button
                onClick={handleNextPage}
                disabled={startIdx + episodesPerPage >= filtered.length}
                className="px-3 py-1 rounded bg-[#1f1f1f] hover:bg-[#2a2a2a] disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
