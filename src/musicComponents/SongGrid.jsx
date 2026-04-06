import React, { useState, useEffect } from "react";
import SongCard from "../musicComponents/SongCard";
import styles from "./SongGrid.module.css";
import { Details } from "../api/HostDetails";
import { useMusic } from "../MusicContext";
import { cursors } from "../api/cursors";
import { useNavigate } from "react-router-dom";

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
  const nav = useNavigate();

  const fetchSongs = async () => {
    setLoading(true);
    try {
      // 1. Initial Cache Check (Only for first load)
      if (cache[apiUrl]) {
        setSongs(cache[apiUrl]);
        setLoading(false);
        return;
      }

      let finalUrl = `${Details.domain}${apiUrl}`;

      const response = await fetch(finalUrl);
      if (response.ok) {
        const data = await response.json();
        const newTracks = data.songs || [];

        setSongs(newTracks);
        setCacheData(apiUrl, newTracks);

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
    fetchSongs();
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
                played={song.play_count}
                likes={song.likes_count}
              />{" "}
            </div>
          ))}{" "}
          {seeMore && hasMore && (
            <div
              className={styles.seeMoreWrapper}
              onClick={() => {
                nav("/batchplay", {
                  state: {
                    apiUrl,
                    cursorKey,
                  },
                });
              }}
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
