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

const SongGrid = ({ title, apiUrl, seeMore = false }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(null); // Initialize as null
  const { cache, setCacheData } = useMusic();

  const loadData = async (isNextBatch = false) => {
    setLoading(true);
    try {
      // 1. Check Cache only for the very first load
      if (!isNextBatch && cache[apiUrl]) {
        setSongs(cache[apiUrl]);
        setLoading(false);
        return;
      }

      // 2. Build URL: append cursor only if it's a "Load More" action
      const requestUrl = isNextBatch
        ? `${Details.domain}${apiUrl}?cursor=${cursor}`
        : `${Details.domain}${apiUrl}`;

      const response = await fetch(requestUrl);
      if (response.ok) {
        const data = await response.json();
        const newTracks = data.songs || [];

        // 3. APPEND if next batch, REPLACE if initial load
        setSongs((prev) => (isNextBatch ? [...prev, ...newTracks] : newTracks));

        // 4. Update cursor and cache
        setCursor(data.nextCursor || null);
        if (!isNextBatch) setCacheData(apiUrl, newTracks);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false); // Initial load
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

          {seeMore && cursor && (
            <div
              className={styles.seeMoreWrapper}
              onClick={() => loadData(true)}
            >
              <div className={styles.seeMoreBtn}>
                <span className={styles.seeMoreLabel}>Load More</span>
                <svg
                  className={styles.seeMoreIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="19" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
            </div>
          )}
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
