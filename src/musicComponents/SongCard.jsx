import React from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import styles from "./SongCard.module.css";

const SongCard = ({
  songName = "Unknown Track",
  songId,
  sequnceApiUrl,
  currentIndex,
}) => {
  const navigate = useNavigate();
  const imageUrl = `https://picsum.photos/seed/${songId}/300/300`;

  const handleClick = () => {
    const sequenceObj = {
      track: sequnceApiUrl,
      currentIndex: currentIndex,
    };
    localStorage.setItem("playersequence", JSON.stringify(sequenceObj));
    navigate(`/play/${songId}`);
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
            <Play fill="white" size={20} style={{ marginLeft: "2px" }} />
          </div>
        </div>
      </div>

      <div className={styles.meta}>
        <h3 className={styles.songTitle}>{songName}</h3>
        <p className={styles.songLabel}>Track</p>
      </div>
    </div>
  );
};

export default SongCard;
