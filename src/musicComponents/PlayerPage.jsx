import React, { useState, useRef, useEffect } from "react";

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

import PlaylistDisplay from "../playlistComp/PlaylistDisplay";
import CreatePlaylistModal from "../playlistComp/CreatePlaylistModal";
import { useMusic } from "../MusicContext";
import NavBar from "../navbarComp/Navbar";
import MusicVisual from "../animations/MusicVisual";
import { getRandomInt } from "../api/mechanism";
import { Details } from "../api/HostDetails";
import { art } from "../api/artProvider";

import { useNotification } from "../context/NotificationContext";

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

  // holds the fully-resolved next track ({ id, song }) once prefetched
  const nextTrackRef = useRef(null);
  // tracks which currentSongId we've already prefetched-for, so we only do it once per song
  const prefetchedForRef = useRef(null);
  // tracks the exact src string WE last assigned to audio.src ourselves —
  // never compare against audio.src read back from the DOM, since the
  // browser resolves it to an absolute URL and it won't match the raw
  // API string, causing false-mismatch double-assignments.
  const lastAssignedSrcRef = useRef(null);

  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playInLoop, setPlayInLoop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();
  const [isPreFetchedSuccess, setIsPreFetchedSuccess] = useState(false);

  //const [isMinimized, setMinimized] = useState(false);

  /* ── Data fetching ── */
  useEffect(() => {
    if (!currentSongId) return;
    if (isPreFetchedSuccess) {
      setIsPreFetchedSuccess(false);
      return;
    }
    const fetchSong = async () => {
      // console.log("general fetch");
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

  // Owns audio.src for every path EXCEPT the onEnded fast-path (which sets
  // it imperatively itself and updates lastAssignedSrcRef to match, so this
  // effect sees "nothing changed" and skips re-assigning / re-playing).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.song_src) return;

    if (lastAssignedSrcRef.current !== song.song_src) {
      lastAssignedSrcRef.current = song.song_src;
      audio.src = song.song_src;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [song]);

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
      artwork: [
        { src: art(song.id).larg, sizes: "512x512", type: "image/png" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", togglePlay);
    navigator.mediaSession.setActionHandler("pause", togglePlay);
    navigator.mediaSession.setActionHandler("nexttrack", () =>
      handleNavigation("next"),
    );
    navigator.mediaSession.setActionHandler("previoustrack", () =>
      handleNavigation("prev"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song]);

  // keep the OS-level play/pause indicator in sync
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // reset prefetch bookkeeping whenever the track actually changes
  useEffect(() => {
    prefetchedForRef.current = null;
    nextTrackRef.current = null;
  }, [currentSongId]);

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

  // pure "what id comes next" resolver, reused by prefetch + handleNavigation + onEnded
  const resolveNextId = (direction) => {
    try {
      const raw = localStorage.getItem("playersequence");
      if (!raw) return getRandomInt(1, 100);
      const { track, currentIndex } = JSON.parse(raw);
      if (!track) return getRandomInt(1, 100);
      const queue = cache[track];
      if (!queue) return null;
      const next = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (next >= 0 && next < queue.length) return queue[next].id;
      return getRandomInt(1, 100);
    } catch (e) {
      console.error("resolveNextId error:", e);
      return null;
    }
  };

  // advance the stored queue index without changing the currently loaded track
  const advanceQueueIndex = () => {
    try {
      const raw = localStorage.getItem("playersequence");
      if (!raw) return;
      const { track, currentIndex } = JSON.parse(raw);
      localStorage.setItem(
        "playersequence",
        JSON.stringify({ track, currentIndex: currentIndex + 1 }),
      );
    } catch (e) {
      console.error("advanceQueueIndex error:", e);
    }
  };

  /* ── Queue navigation (used by buttons / media session / prefetch-miss fallback) ── */
  const handleNavigation = (direction) => {
    try {
      const raw = localStorage.getItem("playersequence") || false;

      if (!raw) {
        playTrack(getRandomInt(1, 100));
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
      addNotification(result.error, "error");
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

      {/* Hidden audio element — no src prop here; src is fully owned imperatively */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (!audio) return;
          setCurrentTime(audio.currentTime);

          // prefetch the next track's data ~15s before this one ends,
          // once per song, so onEnded can play it with zero network dependency.
          if (
            duration &&
            duration - audio.currentTime <= 15 &&
            prefetchedForRef.current !== currentSongId &&
            !playInLoop
          ) {
            prefetchedForRef.current = currentSongId;
            const nextId = resolveNextId("next");
            if (nextId) {
              getSongDetails(nextId)
                .then((res) => {
                  if (res?.song) {
                    setIsPreFetchedSuccess(true);
                    //console.log("prefetch");
                    nextTrackRef.current = { id: nextId, song: res.song };
                  }
                })
                .catch((err) => {
                  console.warn("Prefetch failed:", err);
                  nextTrackRef.current = null;
                });
            }
          }
        }}
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
          const audio = audioRef.current;

          if (playInLoop) {
            audio.currentTime = 0;
            audio.play();
            return;
          }

          const next = nextTrackRef.current;
          nextTrackRef.current = null;

          if (next) {
            // fast path — swap src and play synchronously, no fetch/await
            // in between, so it survives a suspended/screen-off page.
            advanceQueueIndex();

            // Record what we're assigning BEFORE the song-effect can see it,
            // so when setSong() below triggers that effect, it finds
            // lastAssignedSrcRef already matching and skips re-assigning.
            lastAssignedSrcRef.current = next.song.song_src;
            audio.src = next.song.song_src;
            audio
              .play()
              .then(() => setIsPlaying(true))
              .catch((err) => console.warn("Autoplay blocked:", err));

            setSong(next.song);
            setIsLiked(false);
            setCurrentTime(0);

            // Sync context/UI state (route, minimized state, like-flag lookup).
            // Also re-triggers the general-fetch effect, but isPreFetchedSuccess
            // (set during prefetch) causes it to skip the actual network call.
            playTrack(next.id);
          } else {
            // Prefetch didn't land in time (e.g. very short track) — fall back
            handleNavigation("next");
          }
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
                      addNotification("link copied");
                    })
                    .catch((err) => {
                      addNotification("unable to copy link", "error");
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
        setToast={addNotification}
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
          addNotification("Playlist created!", "success");
          setIsCreatePlaylistOpen(false);
        }}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />

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
