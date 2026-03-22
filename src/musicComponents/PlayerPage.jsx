/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heart, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { getSongDetails, checkSongLikedFlag } from "../api/songFunctions";
import styles from "./PlayerPage.module.css";
import { toggleLikeStatus } from "../api/songFunctions";
import SearchLoader from "../animations/SearchLoader";
import Toast from "../NotificationComp/Toast";
import PlaylistDisplay from "../playlistComp/PlaylistDisplay";
import CreatePlaylistModal from "../playlistComp/CreatePlaylistModal";
import { useMusic } from "../MusicContext";
import { useNavigate } from "react-router-dom";
import NavBar from "../navbarComp/Navbar";
const PlayerPage = () => {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const { cache, setCacheData } = useMusic();
  const navigate = useNavigate();

  const handleNavigation = (direction) => {
    try {
      const rawData = localStorage.getItem("playersequence");

      if (!rawData || rawData === "[object Object]") {
        console.error(
          "Storage is corrupted or empty. Go back to Home and click a song.",
        );
        return;
      }

      const { track, currentIndex } = JSON.parse(rawData);
      const songsInQueue = cache[track];

      if (!songsInQueue) {
        console.error("Queue not found in cache for track:", track);
        return;
      }

      const nextIndex =
        direction === "next" ? currentIndex + 1 : currentIndex - 1;

      if (nextIndex >= 0 && nextIndex < songsInQueue.length) {
        const nextSong = songsInQueue[nextIndex];

        // Save the NEW index back to storage
        localStorage.setItem(
          "playersequence",
          JSON.stringify({
            track,
            currentIndex: nextIndex,
          }),
        );

        navigate(`/play/${nextSong.id}`);
      }
    } catch (error) {
      console.error("Failed to parse navigation data:", error);
    }
  };

  // Initialize the state as "hidden"
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // A helper function to trigger the toast easily
  const showToast = (msg, flag) => {
    setToast({ show: true, message: msg, type: flag });
  };

  const toggleModal = () => {
    setIsPlaylistOpen(!isPlaylistOpen);
  };

  const toggleCreatePlaylist = () => {
    setIsCreatePlaylistOpen(!isCreatePlaylistOpen);
  };

  const audioRef = useRef(null);

  useEffect(() => {
    const fetchSong = async () => {
      const res = await getSongDetails(id);
      if (res && res.song) {
        setSong(res.song);
      } else {
        console.error("Failed to fetch song or song not found");
      }
    };
    fetchSong();
  }, [id]);

  useEffect(() => {
    const checkFlag = async () => {
      const res = await checkSongLikedFlag(id);

      if (res && res.alreadyLiked) {
        setIsLiked(true);
      } else {
        setIsLiked(false);
      }
    };

    if (id) {
      checkFlag();
    }
  }, [id]);
  const handleLikeClick = async () => {
    const previousState = isLiked;
    setIsLiked(!isLiked);
    const result = await toggleLikeStatus(id);

    if (!result.success) {
      setIsLiked(previousState);
      alert(result.error);
    } else {
      console.log(result.message);
    }
  };
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => setCurrentTime(audioRef.current.currentTime);
  const onLoadedMetadata = () => setDuration(audioRef.current.duration);

  const handleSliderChange = (e) => {
    const time = e.target.value;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // While waiting for the API/Render to wake up
  if (!song) {
    return (
      <div className={styles.fullPlayerContainer}>
        <SearchLoader></SearchLoader>
      </div>
    );
  }

  return (
    <div className={styles.fullPlayerContainer}>
      <div
        style={{
          height: "fit-content",
          width: "100%",
          position: "fixed",
          left: "0px",
          top: "0px",
        }}
      > <NavBar/></div>
      <audio
        ref={audioRef}
        src={song.song_src} // From your response structure
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
      />
      <div className={styles.topSection}>
        <h1>NOW PLAYING</h1>
      </div>
      <div className={styles.imageContainer}>
        <img
          src={`https://picsum.photos/seed/${song.id}/400`}
          alt="Album Art"
          className={styles.albumArt}
        />
        <div
          className={styles.imageGlow}
          style={{
            backgroundImage: `url(https://picsum.photos/seed/${song.id}/400)`,
          }}
        ></div>
      </div>
      <div className={styles.infoSection}>
        <div className={styles.details}>
          <h2>{song.title}</h2>
          <p>{song.creator_name}</p>
        </div>
        <button
          className={styles.likeButton}
          onClick={handleLikeClick}
          style={{ color: isLiked ? "#ef4444" : "#64748b" }}
        >
          <Heart fill={isLiked ? "currentColor" : "none"} size={28} />
        </button>

        <button
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "solid 0px",
          }}
          type="button"
          onClick={() => {
            console.log("clicked");
            toggleModal();
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
            class="lucide lucide-list-plus-icon lucide-list-plus"
          >
            <path d="M16 5H3" />
            <path d="M11 12H3" />
            <path d="M16 19H3" />
            <path d="M18 9v6" />
            <path d="M21 12h-6" />
          </svg>
        </button>
      </div>
      <div className={styles.controlsSection}>
        <input
          type="range"
          className={styles.slider}
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSliderChange}
        />
        <div className={styles.timeInfo}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className={styles.mainButtons}>
          <SkipBack
            size={32}
            fill="white"
            cursor="pointer"
            onClick={() => handleNavigation("prev")}
          />
          <button className={styles.playPauseBtn} onClick={togglePlay}>
            {isPlaying ? (
              <Pause size={35} fill="black" />
            ) : (
              <Play size={35} fill="black" style={{ marginLeft: "4px" }} />
            )}
          </button>
          <SkipForward
            size={32}
            fill="white"
            cursor="pointer"
            onClick={() => handleNavigation("next")}
          />
        </div>
      </div>
      <PlaylistDisplay
        show={isPlaylistOpen}
        songId={id}
        setToast={showToast} // Pass the actual function
        onClose={() => setIsPlaylistOpen(false)} // Pass the close handler
        onNewPlaylist={toggleCreatePlaylist}
        closeFromOutside={() => setIsPlaylistOpen(false)}
      />
      <CreatePlaylistModal
        show={isCreatePlaylistOpen}
        onSuccess={() => {
          showToast("New playlist created!!", "success");
          setIsCreatePlaylistOpen(false);
          setIsPlaylistOpen(false);
        }}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default PlayerPage;
