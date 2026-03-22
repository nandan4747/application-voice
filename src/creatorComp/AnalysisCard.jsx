import React from "react";
import { Play, Heart, Calendar, Music2 } from "lucide-react";
import styles from "./AnalysisCard.module.css";

const AnalysisCard = ({ song }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.songInfo}>
        <div className={styles.iconCircle}>
          <Music2 size={24} color="#facc15" />
        </div>
        <div>
          <h3>{song.title}</h3>
          <span className={styles.genreTag}>{song.genre}</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <Play size={16} />
          <span>{song.play_count} Plays</span>
        </div>
        <div className={styles.statBox}>
          <Heart size={16} fill="#ef4444" color="#ef4444" />
          <span>{song.likes_count} Likes</span>
        </div>
      </div>

      <div className={styles.footer}>
        <Calendar size={14} />
        <span>Released: {formatDate(song.created_at)}</span>
      </div>
    </div>
  );
};

export default AnalysisCard;
