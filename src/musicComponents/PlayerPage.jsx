import React, { useState, useRef, useEffect, useCallback } from "react";

import {
  Heart,
  ListPlus,
  SkipForward,
  SkipBack,
  Play,
  Pause,
} from "lucide-react";
import {
  getSongDetails,
  checkSongLikedFlag,
  toggleLikeStatus,
} from "../api/songFunctions";
import styles from "./PlayerPage.module.css";
import SearchLoader from "../animations/SearchLoader";
import Toast from "../NotificationComp/Toast";
import PlaylistDisplay from "../playlistComp/PlaylistDisplay";
import CreatePlaylistModal from "../playlistComp/CreatePlaylistModal";
import { useMusic } from "../MusicContext";
import NavBar from "../navbarComp/Navbar";
import MusicVisual from "../animations/MusicVisual";
import { getRandomInt } from "../api/mechanism";
import { Details } from "../api/HostDetails";
import { art } from "../api/artProvider";

const PlayerPage = () => {
  const {
    currentSongId,
    isPlayerMinimized,
    setIsPlayerMinimized,
    cache,
    playTrack,
    closePlayer,
  } = useMusic();
  const audioRef = useRef(null);

  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playInLoop, setPlayInLoop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  //const [isMinimized, setMinimized] = useState(false);

  const showToast = (msg, type = "success") =>
    setToast({ show: true, message: msg, type });
  const closeToast = useCallback(
    () => setToast({ show: false, message: "", type: "success" }),
    [],
  );

  /* ── Data fetching ── */
  useEffect(() => {
    if (!currentSongId) return;
    const fetchSong = async () => {
      setIsLoading(true);
      setIsPlaylistOpen(false);
      setIsLiked(false);
      try {
        const res = await getSongDetails(currentSongId);
        if (!res) {
          playTrack(getRandomInt(1, 120));
          return;
        }
        if (res?.song) setSong(res.song);
      } catch (err) {
        console.error("Failed to fetch song, retrying with random track:", err);
        playTrack(getRandomInt(1, 120));
      } finally {
        setIsLoading(false);
      }
    };
    fetchSong();
  }, [currentSongId, playTrack]);

  useEffect(() => {
    if (!currentSongId) return;

    const checkFlag = async () => {
      const loginFlag = localStorage.getItem("isLoggedIn") === "yes";
      if (!loginFlag) return;
      const res = await checkSongLikedFlag(currentSongId);
      setIsLiked(!!res?.alreadyLiked);
    };
    checkFlag();
  }, [currentSongId]);

  useEffect(() => {
    if (!song || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.creator_name,
      artwork: [{ src: artUrl, sizes: "512x512", type: "image/png" }],
    });

    navigator.mediaSession.setActionHandler("play", togglePlay);
    navigator.mediaSession.setActionHandler("pause", togglePlay);
    navigator.mediaSession.setActionHandler("nexttrack", () =>
      handleNavigation("next"),
    );
    navigator.mediaSession.setActionHandler("previoustrack", () =>
      handleNavigation("prev"),
    );
  }, [song]);

  if (!currentSongId) return null;

  if (!song) {
    return (
      <div
        className={
          isPlayerMinimized ? styles.miniPlayer : styles.fullPlayerContainer
        }
      >
        <div className={styles.loadingScreen}>
          <SearchLoader />
        </div>
      </div>
    );
  }

  const handleMinimizeToggle = () => {
    setIsPlayerMinimized(!isPlayerMinimized);
  };

  /* ── Playback handlers ── */
  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e) => {
    audioRef.current.currentTime = e.target.value;
    setCurrentTime(Number(e.target.value));
  };

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* ── Queue navigation ── */
  const handleNavigation = (direction) => {
    try {
      const raw = localStorage.getItem("playersequence") || false;

      if (!raw) {
        return;
      }
      const { track, currentIndex } = JSON.parse(raw);
      if (!track) {
        playTrack(getRandomInt(1, 100));
      }

      const queue = cache[track];
      if (!queue) return;

      const next = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (next >= 0 && next < queue.length) {
        localStorage.setItem(
          "playersequence",
          JSON.stringify({ track, currentIndex: next }),
        );
        const songId = queue[next].id;

        playTrack(songId);

        return;
      }

      // generating random int to play song randomly if there's no song left in the sequence
      playTrack(getRandomInt(1, 100));
    } catch (e) {
      console.error("Navigation error:", e);
    }
  };

  /* ── Like toggle ── */
  const handleLikeClick = async () => {
    const prev = isLiked;
    setIsLiked(!prev);
    const result = await toggleLikeStatus(currentSongId);
    if (!result.success) {
      setIsLiked(prev);
      showToast(result.error, "failure");
    }
  };

  const artUrl = art(song.id).larg;

  return (
    <div
      className={
        isPlayerMinimized ? styles.miniPlayer : styles.fullPlayerContainer
      }
    >
      {isLoading && (
        <div className={styles.loadingScreen}>
          <SearchLoader />
        </div>
      )}
      {!isPlayerMinimized && (
        <div className={styles.back_btn} onClick={handleMinimizeToggle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-chevron-down-icon lucide-chevron-down"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      )}

      {/* Ambient background bloom */}

      <div
        className={styles.ambientBg}
        style={{ backgroundImage: `url(${artUrl})` }}
      />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={song.song_src}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onCanPlay={(e) => {
          e.target
            .play()
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.warn("Autoplay blocked:", err);
              setIsPlaying(false);
            });
        }}
        onEnded={() => {
          if (playInLoop) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            return;
          }
          handleNavigation("next");
        }}
      />

      <div
        className={
          isPlayerMinimized ? styles.playerContent_mini : styles.playerContent
        }
      >
        {/* Album art */}
        <div className={styles.imageContainer}>
          <img
            src={artUrl}
            alt={song.title}
            className={styles.albumArt}
            draggable={false}
            onClick={() => setIsPlayerMinimized(false)}
          />
          <div
            className={styles.imageGlow}
            style={{ backgroundImage: `url(${artUrl})` }}
          />
        </div>

        {/* Song info + action buttons */}
        <div className={styles.infoSection}>
          <div
            className={`${styles.details} josefin-sans-custom`}
            onClick={() => {
              setIsPlayerMinimized(false);
            }}
          >
            <h2>{song.title}</h2>
            <p
              style={
                isPlayerMinimized
                  ? {
                      alignSelf: "start",
                      textAlign: "start",
                    }
                  : {
                      alignSelf: "center",
                      textAlign: "center",
                    }
              }
            >
              {song.creator_name}
            </p>
          </div>
          {!isPlayerMinimized && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",

                width: "100%",
                justifyContent: "space-between",
              }}
            >
              {/* Add to playlist */}
              <button
                className={styles.actionBtn}
                onClick={() => setIsPlaylistOpen(true)}
                aria-label="Add to playlist"
              >
                <ListPlus size={18} strokeWidth={1.8} />
              </button>

              {/*share button */}
              <button
                className={styles.actionBtn}
                type="button"
                onClick={() => {
                  const url = `${Details.appDomain}play/${currentSongId}`;
                  navigator.clipboard
                    .writeText(url)
                    .then(() => {
                      showToast("link copied");
                    })
                    .catch((err) => {
                      showToast("unable to copy link", "error");
                      console.log(err);
                    });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-share2-icon lucide-share-2"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                  <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                </svg>
              </button>

              {/* Like */}
              <button
                className={`${styles.actionBtn} ${isLiked ? styles.actionBtnLiked : ""}`}
                onClick={handleLikeClick}
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <Heart
                  size={18}
                  fill={isLiked ? "currentColor" : "none"}
                  strokeWidth={1.8}
                />
              </button>

              {/* loop button  */}
              <button
                type="button"
                className={styles.loop_btn}
                onClick={() => {
                  setPlayInLoop(!playInLoop);
                }}
              >
                {!playInLoop && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-repeat-icon lucide-repeat"
                  >
                    <path d="m17 2 4 4-4 4" />
                    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                    <path d="m7 22-4-4 4-4" />
                    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                  </svg>
                )}

                {playInLoop && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-repeat-off-icon lucide-repeat-off"
                  >
                    <path d="M11.656 6H21l-4-4" />
                    <path d="M17.898 17.898A4 4 0 0 1 17 18H3l4-4" />
                    <path d="m2 2 20 20" />
                    <path d="M21 13v1a4 4 0 0 1-.171 1.159" />
                    <path d="m21 6-4 4" />
                    <path d="M3 11v-1a4 4 0 0 1 3.102-3.898" />
                    <path d="m7 22-4-4" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        {!isPlayerMinimized && (
          <div className={styles.controlsSection}>
            <input
              type="range"
              className={styles.slider}
              min="0"
              max={duration || 0}
              value={currentTime}
              step="0.1"
              onChange={handleSliderChange}
            />
            <div className={styles.timeInfo}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className={styles.mainButtons}>
              <button
                className={styles.skipBtn}
                onClick={() => handleNavigation("prev")}
                aria-label="Previous"
              >
                <SkipBack size={28} fill="currentColor" />
              </button>

              <button
                className={styles.playPauseBtn}
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={28} fill="black" color="black" />
                ) : (
                  <Play
                    size={28}
                    fill="black"
                    color="black"
                    style={{ marginLeft: 3 }}
                  />
                )}
              </button>

              <button
                className={styles.skipBtn}
                onClick={() => handleNavigation("next")}
                aria-label="Next"
              >
                <SkipForward size={28} fill="currentColor" />
              </button>
            </div>
          </div>
        )}
        {/* Visualiser */}
        {!isPlayerMinimized && (
          <div className={styles.topSection}>
            <MusicVisual isPlaying={isPlaying} />
          </div>
        )}
      </div>

      {/* Modals */}
      <PlaylistDisplay
        show={isPlaylistOpen}
        songId={currentSongId}
        setToast={showToast}
        onClose={() => setIsPlaylistOpen(false)}
        onNewPlaylist={() => {
          setIsPlaylistOpen(false);
          setIsCreatePlaylistOpen(true);
        }}
        closeFromOutside={() => setIsPlaylistOpen(false)}
      />

      <CreatePlaylistModal
        show={isCreatePlaylistOpen}
        onSuccess={() => {
          showToast("Playlist created!", "success");
          setIsCreatePlaylistOpen(false);
        }}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {isPlayerMinimized && (
        <div
          className={`${styles.cancelBtn}`}
          onClick={() => {
            closePlayer();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-x-icon lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default PlayerPage;
