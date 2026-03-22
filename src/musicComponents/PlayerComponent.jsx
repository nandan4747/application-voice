import React, { useState, useRef } from "react";
import { Heart, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import styles from "./Player.module.css"; // Importing your pure CSS

const PlayerComponent = ({
  songSrc,
  songName,
  artistName,
  isLikedInitial = false,
  onLikeToggle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(isLikedInitial);

  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime);
  const handleLoadedMetadata = () => setDuration(audioRef.current.duration);

  const handleProgressChange = (e) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className={styles.playerContainer}>
      <audio
        ref={audioRef}
        src={songSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className={styles.songInfo}>
        <div className={styles.albumArt} />
        <div className={styles.songDetails}>
          <h4>{songName}</h4>
          <p>{artistName}</p>
        </div>
        <button
          onClick={() => {
            setIsLiked(!isLiked);
            onLikeToggle?.();
          }}
          className={`${styles.likeButton} ${isLiked ? styles.liked : styles.notLiked}`}
        >
          <Heart fill={isLiked ? "currentColor" : "none"} size={20} />
        </button>
      </div>

      <div className={styles.controlsSection}>
        <div className={styles.buttonGroup}>
          <SkipBack size={20} color="#a1a1aa" cursor="pointer" />
          <button onClick={togglePlay} className={styles.playButton}>
            {isPlaying ? (
              <Pause size={24} fill="black" />
            ) : (
              <Play size={24} fill="black" style={{ marginLeft: "2px" }} />
            )}
          </button>
          <SkipForward size={20} color="#a1a1aa" cursor="pointer" />
        </div>

        <div className={styles.progressBarContainer}>
          <span className={styles.timeLabel}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className={styles.slider}
          />
          <span className={styles.timeLabel}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Spacer for Desktop symmetry */}
      <div style={{ width: "33.33%" }} className="hidden md:block" />
    </div>
  );
};

export default PlayerComponent;
