import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const PlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cache } = useMusic();
  const audioRef = useRef(null);

  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playInLoop, setPlayInLoop] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (msg, type = "success") =>
    setToast({ show: true, message: msg, type });
  const closeToast = useCallback(
    () => setToast({ show: false, message: "", type: "success" }),
    [],
  );

  /* ── Data fetching ── */
  useEffect(() => {
    const fetchSong = async () => {
      const res = await getSongDetails(id);
      if (res?.song) setSong(res.song);
    };
    fetchSong();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const checkFlag = async () => {
      const res = await checkSongLikedFlag(id);
      setIsLiked(!!res?.alreadyLiked);
    };
    checkFlag();
  }, [id]);

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
      // console.log("getting raw");
      //console.log("raw value : ", raw);
      if (!raw) {
        return;
      }
      const { track, currentIndex } = JSON.parse(raw);
      if (!track) {
        navigate(`/play/${getRandomInt(1, 90)}`, { replace: true });
      }
      const queue = cache[track];
      if (!queue) return;

      const next = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (next >= 0 && next < queue.length) {
        //console.log("exe");
        localStorage.setItem(
          "playersequence",
          JSON.stringify({ track, currentIndex: next }),
        );
        return navigate(`/play/${queue[next].id}`, { replace: true });
      }
      // generating random int to play song randomly if there's no song left in the sequence
      navigate(`/play/${getRandomInt(1, 90)}`, { replace: true });
    } catch (e) {
      console.error("Navigation error:", e);
    }
  };

  /* ── Like toggle ── */
  const handleLikeClick = async () => {
    const prev = isLiked;
    setIsLiked(!prev);
    const result = await toggleLikeStatus(id);
    if (!result.success) {
      setIsLiked(prev);
      showToast(result.error, "failure");
    }
  };

  /* ── Loading state ── */
  if (!song) {
    return (
      <div className={styles.loadingScreen}>
        <SearchLoader />
      </div>
    );
  }

  const artUrl = `https://picsum.photos/seed/${song.id}/400`;

  return (
    <div className={styles.fullPlayerContainer}>
      {/* Ambient background bloom */}
      <div
        className={styles.ambientBg}
        style={{ backgroundImage: `url(${artUrl})` }}
      />

      {/* Fixed navbar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 100,
        }}
      >
        <NavBar />
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={song.song_src}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onCanPlay={(e) => {
          try {
            e.target.play();
            setIsPlaying(true);
          } catch {
            /* autoplay blocked — user can press play */
          }
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

      <div className={styles.playerContent}>
        {/* Visualiser */}
        <div className={styles.topSection}>
          <MusicVisual isPlaying={isPlaying} />
        </div>

        {/* Album art */}
        <div className={styles.imageContainer}>
          <img
            src={artUrl}
            alt={song.title}
            className={styles.albumArt}
            draggable={false}
          />
          <div
            className={styles.imageGlow}
            style={{ backgroundImage: `url(${artUrl})` }}
          />
        </div>

        {/* Song info + action buttons */}
        <div className={styles.infoSection}>
          <div className={styles.details}>
            <h2>{song.title}</h2>
            <p
              style={{
                alignSelf: "center",
                textAlign: "center",
              }}
            >
              {song.creator_name}
            </p>
          </div>

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
        </div>

        {/* Controls */}
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
      </div>

      {/* Modals */}
      <PlaylistDisplay
        show={isPlaylistOpen}
        songId={id}
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
    </div>
  );
};

export default PlayerPage;
