import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SongListItem.module.css";

const SongListItem = ({
  songId,
  songName = "name",
  sequnceApiUrl,
  currentIndex,
}) => {
  const navigate = useNavigate();

  // Unique image per ID so your UI doesn't look like a hall of mirrors
  const imageUrl = `https://picsum.photos/seed/${songId}/150/150`;

  const handleNavigate = () => {
    const sequenceObj = {
      track: sequnceApiUrl,
      currentIndex: currentIndex,
    };

    localStorage.setItem("playersequence", JSON.stringify(sequenceObj));
    navigate(`/play/${songId}`);
  };

  return (
    <div className={styles.itemContainer} onClick={handleNavigate}>
      <div className={styles.imageBox}>
        <img src={imageUrl} alt={songName} className={styles.coverImage} />
      </div>

      <div className={styles.textDetails}>
        <h4 className={styles.title}>{songName}</h4>
      </div>
    </div>
  );
};

export default SongListItem;
