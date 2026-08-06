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
import ProgressBar from "./ProgressBar";

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
  // a detached, off-DOM <audio> used purely to force the browser to actually
  // download and cache the next track's bytes *while the current track is
  // still playing* (full network priority). At onEnded we point the real
  // audioRef at the same URL, which should then be a cache hit instead of a
  // brand-new network request — new network requests for untouched URLs are
  // what mobile Chrome blocks/fails on a hidden/screen-locked tab, which is
  // the actual "NotSupportedError" you're seeing.
  const preloadAudioRef = useRef(null);
  if (!preloadAudioRef.current && typeof Audio !== "undefined") {
    preloadAudioRef.current = new Audio();
    preloadAudioRef.current.preload = "auto";
  }

  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playInLoop, setPlayInLoop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();
  // when true, the next fetchSong effect run is skipped because onEnded
  // already swapped in the prefetched song synchronously
  const [isPreFetchedSuccess, setIsPreFetchedSuccess] = useState(false);

  //const [isMinimized, setMinimized] = useState(false);

  /* ── Data fetching ── */
  useEffect(() => {
    if (!currentSongId) return;
    // onEnded already swapped audioRef.current.src + song state directly —
    // skip the redundant network fetch for the track we just prefetched.
    if (isPreFetchedSuccess) {
      setIsPreFetchedSuccess(false);
      return;
    }
    const fetchSong = async () => {
      setIsLoading(true);
      setIsPlaylistOpen(false);
      setIsLiked(false);
      try {
        const res = await getSongDetails(currentSongId);
        /*console.log("fetching song details");*/
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
  }, [currentSongId, playTrack, isPreFetchedSuccess]);

  // reset prefetch bookkeeping whenever the track actually changes
  useEffect(() => {
    prefetchedForRef.current = null;
    nextTrackRef.current = null;
  }, [currentSongId]);

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

  // Imperative src sync — the single source of truth for what the <audio>
  // element loads. Only writes .src (and reloads) when it's actually out of
  // sync with the current song, so onEnded's fast-path swap (which already
  // set .src/.load()/.play() directly on the node) is never redone here and
  // never aborts its own in-flight play().
  useEffect(() => {
    if (!song || !audioRef.current) return;
    const audio = audioRef.current;
    const targetSrc = new URL(song.song_src, window.location.href).href;
    if (audio.src === targetSrc) return;
    audio.src = song.song_src;
    audio.load();
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

  const formatTime = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // pure "what id comes next" resolver, reused by prefetch + handleNavigation
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

  // advance the stored queue index without touching the currently loaded track
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

  /* ── Queue navigation (buttons / media session / prefetch-miss fallback) ── */
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

      {/* Hidden audio element — src is managed imperatively below, not via JSX,
          so React's re-render after setSong() never re-writes it and aborts
          an in-flight play() (see the sync effect above onCanPlay). */}
      <audio
        ref={audioRef}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (!audio || !duration) return;

          // Prefetch the next track's data ~15s before this one ends, once
          // per song, while audio is still actively playing — the tab has
          // full network/CPU priority at this point, screen-off or not.
          if (
            duration - audio.currentTime <= 20 &&
            prefetchedForRef.current !== currentSongId &&
            !playInLoop
          ) {
            prefetchedForRef.current = currentSongId;
            const nextId = resolveNextId("next");
            if (nextId) {
              getSongDetails(nextId)
                .then((res) => {
                  if (res?.song) {
                    nextTrackRef.current = { id: nextId, song: res.song };
                    // Actually start downloading the audio file now, while
                    // this tab still has full network access. This is what
                    // makes onEnded's swap a cache hit instead of a fresh
                    // (and possibly blocked) background network request.
                    const buffer = preloadAudioRef.current;
                    if (buffer) {
                      buffer.src = res.song.song_src;
                      buffer.load();
                    }
                  }
                })
                .catch((err) => {
                  console.warn("Prefetch failed:", err);
                  nextTrackRef.current = null;
                });
            }
          }
        }}
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
            // Fast path: swap src and call play() directly on the DOM node,
            // synchronously, BEFORE any setState — state updates can wait,
            // playback can't. The URL was already downloaded into
            // preloadAudioRef while this track was playing, so this load()
            // should resolve from the browser's own cache instead of opening
            // a brand-new background network connection.
            advanceQueueIndex();
            audio.src = next.song.song_src;
            audio.load();
            audio
              .play()
              .then(() => setIsPlaying(true))
              .catch((err) => {
                console.warn("Autoplay blocked:", err);
                // If even the cache-primed load failed (e.g. prefetch didn't
                // finish downloading in time), fall back to a plain
                // network-driven next once we're back in the foreground.
                setIsPlaying(false);
              });

            // Sync React state / context after playback has already started.
            setIsPreFetchedSuccess(true);
            setSong(next.song);
            setIsLiked(false);
            playTrack(next.id);
          } else {
            // Prefetch didn't land in time (e.g. a very short track) — fall
            // back to the normal network-driven path.
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
            <ProgressBar
              audioRef={audioRef}
              duration={duration}
              formatTime={formatTime}
            />

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
