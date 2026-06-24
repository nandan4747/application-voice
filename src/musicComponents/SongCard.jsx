import React from "react";

import { Play } from "lucide-react";
import styles from "./SongCard.module.css";
import { useMusic } from "../MusicContext";
import { art } from "../api/artProvider";

const SongCard = ({
  songName = "Unknown Track",
  songId,
  likes,
  played,
  sequnceApiUrl,
  currentIndex,
}) => {
  const { playTrack } = useMusic();
  // const imageUrl = `https://picsum.photos/seed/${songId}/400/400`;
  //const imageUrl = `https://loremflickr.com/200/200/music,abstract?lock=${songId}`;
  const imageUrl = art(songId).medium;

  const handleClick = () => {
    const sequenceObj = {
      track: sequnceApiUrl,
      currentIndex: currentIndex,
    };
    localStorage.setItem("playersequence", JSON.stringify(sequenceObj));
    playTrack(songId);
    //navigate(`/play/${songId}`);
  };

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt={songName}
          className={styles.songImage}
          loading="lazy"
          draggable={false}
        />
        <div className={styles.playOverlay}>
          <div className={styles.playButton}>
            <Play fill="white" size={18} style={{ marginLeft: "2px" }} />
          </div>
        </div>
        <span className={styles.badge}>Track</span>
      </div>

      <div className={styles.meta}>
        <p className={styles.songTitle}>{songName}</p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 10v3" />
              <path d="M6 6v11" />
              <path d="M10 3v18" />
              <path d="M14 8v7" />
              <path d="M18 5v13" />
              <path d="M22 10v3" />
            </svg>
            <span className={styles.statValue}>{played}</span>
          </div>

          <div className={styles.stat}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            </svg>
            <span className={styles.statValue}>{likes}</span>
          </div>
        </div>

        <div className={styles.divider} />
      </div>
    </div>
  );
};

export default SongCard;
