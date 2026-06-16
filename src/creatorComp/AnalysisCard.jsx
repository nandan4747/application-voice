import React, { useState, useCallback } from "react";
import { Play, Heart, Calendar, Music2, Trash2, Loader2 } from "lucide-react";
import styles from "./AnalysisCard.module.css";
import { deleteSongTrack } from "../api/creatorFunctions";



const AnalysisCard = ({ song, onDeleted, onToast }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await deleteSongTrack(song.id);
      if (result?.success) {
        onToast(result.message, "success");
        onDeleted?.(song.id);
      } else {
        onToast(result?.message ?? "Something went wrong.", "error");
      }
    } catch {
      onToast("Unable to delete song.", "error");
    } finally {
      setIsDeleting(false);
    }
  }, [song.id, isDeleting, onDeleted]);

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
        <div className={styles.footerLeft}>
          <Calendar size={14} />
          <span>Released: {formatDate(song.created_at)}</span>
        </div>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete song"
        >
          {isDeleting ? (
            <Loader2 size={14} className={styles.spinner} />
          ) : (
            <Trash2 size={14} />
          )}
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default AnalysisCard;