import React, { useState, useEffect } from "react";
import SongCard from "../musicComponents/SongCard";
import styles from "./SongGrid.module.css";
import { Details } from "../api/HostDetails";
import { useMusic } from "../MusicContext";

const SKELETON_COUNT = 6;

const SkeletonGrid = () => (
  <div className={styles.skeletonRow}>
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <div key={i} className={styles.skeleton}>
        <div className={styles.skeletonImage} />
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSub} />
      </div>
    ))}
  </div>
);

const SongGrid = ({ title, apiUrl }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cache, setCacheData } = useMusic();

  useEffect(() => {
    if (!apiUrl) return;

    const fetchSongs = async () => {
      setLoading(true);
      try {
        if (cache[apiUrl]) {
          setSongs(cache[apiUrl]);
          return;
        }
        const response = await fetch(`${Details.domain}${apiUrl}`);
        if (response.ok) {
          const data = await response.json();
          const tracks = data.songs || [];
          setSongs(tracks);
          setCacheData(apiUrl, tracks);
        }
      } catch (error) {
        console.error("SongGrid fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [apiUrl]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <p className={styles.eyebrow}>Collection</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <div className={styles.divider} />
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : songs.length > 0 ? (
        <div className={styles.scrollRow}>
          {songs.map((song, index) => (
            <div key={song.id} className={styles.cardWrapper}>
              <SongCard
                songId={song.id}
                songName={song.title}
                sequnceApiUrl={apiUrl}
                currentIndex={index}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>♪</span>
          <p className={styles.emptyText}>
            No tracks found in this collection.
          </p>
        </div>
      )}
    </div>
  );
};

export default SongGrid;
