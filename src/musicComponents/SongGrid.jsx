import React, { useState, useEffect } from "react";
import SongCard from "../musicComponents/SongCard";
import styles from "./SongGrid.module.css";
import { Details } from "../api/HostDetails";
import { useMusic } from "../MusicContext";
import { cursors } from "../api/cursors";

const SKELETON_COUNT = 6;

const SkeletonGrid = () => (
  <div className={styles.skeletonRow}>
    {" "}
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <div key={i} className={styles.skeleton}>
        <div className={styles.skeletonImage} />
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSub} />{" "}
      </div>
    ))}{" "}
  </div>
);

const SongGrid = ({ title, apiUrl, seeMore = false, cursorKey = "" }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cache, setCacheData } = useMusic();
  // We don't really need local cursor state if we use the global cursors object
  const [hasMore, setHasMore] = useState(true);

  const fetchSongs = async (isLoadMore = false) => {
    setLoading(true);
    try {
      // 1. Initial Cache Check (Only for first load)
      if (!isLoadMore && cache[apiUrl]) {
        setSongs(cache[apiUrl]);
        setLoading(false);
        return;
      }

      let finalUrl = `${Details.domain}${apiUrl}`;
      if (isLoadMore && cursorKey && cursors[cursorKey]) {
        finalUrl += `?cursor=${cursors[cursorKey]}`;
      }

      const response = await fetch(finalUrl);
      if (response.ok) {
        const data = await response.json();
        const newTracks = data.songs || [];

        // 2. Calculate the updated full list
        // If we are loading more, combine old songs with new ones.
        const updatedList = isLoadMore ? [...songs, ...newTracks] : newTracks;

        // 3. Update Local State AND Global Cache
        setSongs(updatedList);
        setCacheData(apiUrl, updatedList); // Always update the cache with the full list!

        // 4. Handle Cursors
        if (cursorKey) {
          cursors[cursorKey] = data.nextCursor || "";
          setHasMore(!!data.nextCursor);
        }
      }
    } catch (error) {
      console.error("SongGrid fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!apiUrl) return;
    fetchSongs(false); // Initial load
  }, [apiUrl]);

  return (
    <div className={styles.container}>
      {" "}
      <div className={styles.header}>
        {" "}
        <div className={styles.titleGroup}>
          <p className={styles.eyebrow}>Collection</p>{" "}
          <h2 className={styles.title}>{title}</h2>{" "}
        </div>
        <div className={styles.divider} />{" "}
      </div>{" "}
      {loading ? (
        <SkeletonGrid />
      ) : songs.length > 0 ? (
        <div className={styles.scrollRow}>
          {" "}
          {songs.map((song, index) => (
            <div key={song.id} className={styles.cardWrapper}>
              {" "}
              <SongCard
                songId={song.id}
                songName={song.title}
                sequnceApiUrl={apiUrl}
                currentIndex={index}
              />{" "}
            </div>
          ))}{" "}
          {seeMore && hasMore && (
            <div
              className={styles.seeMoreWrapper}
              onClick={() => fetchSongs(true)}
            >
              {" "}
              <div className={styles.seeMoreBtn}>
                {" "}
                <span className={styles.seeMoreLabel}>Load More</span>{" "}
                <svg
                  className={styles.seeMoreIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {" "}
                  <circle cx="5" cy="12" r="1.5" fill="currentColor" />{" "}
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />{" "}
                  <circle cx="19" cy="12" r="1.5" fill="currentColor" />{" "}
                </svg>{" "}
              </div>{" "}
            </div>
          )}{" "}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>♪</span>{" "}
          <p className={styles.emptyText}>
            No tracks found in this collection.{" "}
          </p>{" "}
        </div>
      )}{" "}
    </div>
  );
};

export default SongGrid;
