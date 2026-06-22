import React from "react";
import styles from "./SongListItem.module.css";
import { useMusic } from "../MusicContext";

const SongListItem = ({
  songId,
  songName = "Unknown Track",
  likes,
  played,
  sequnceApiUrl,
  currentIndex,
}) => {
  const { playTrack } = useMusic();
  //const imageUrl = `https://picsum.photos/seed/${songId}/400/400`;
  const imageUrl = `https://loremflickr.com/50/50/music,abstract?lock=${songId}`;

  const handleNavigate = () => {
    const sequenceObj = {
      track: sequnceApiUrl,
      currentIndex: currentIndex,
    };
    localStorage.setItem("playersequence", JSON.stringify(sequenceObj));
    playTrack(songId);
  };

  return (
    <div
      className={styles.itemContainer}
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
    >
      <div className={styles.imageBox}>
        <img
          src={imageUrl}
          alt={songName}
          className={styles.coverImage}
          loading="lazy"
          draggable={false}
        />
      </div>

      <div className={styles.textDetails}>
        <p className={styles.title}>{songName}</p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
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
              width="12"
              height="12"
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
      </div>

      <div className={styles.playHint}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </div>
    </div>
  );
};

export default SongListItem;
