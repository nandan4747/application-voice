import React, { useState, useEffect } from "react";
import styles from "./PlayerPage.module.css";

const ProgressBar = ({ audioRef, duration, formatTime }) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Listen to audio time updates directly on the ref
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    // Clean up listener on unmount
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioRef]);

  const handleSliderChange = (e) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = e.target.value;
    setCurrentTime(Number(e.target.value));
  };

  return (
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
    </div>
  );
};

export default ProgressBar;
