import { useMusic } from "../MusicContext";
import { cursors } from "../api/cursors";
import { useState, useEffect, useRef, useCallback } from "react";
import SongListItem from "./SongListItem";
import { useLocation } from "react-router-dom";
import { Details } from "../api/HostDetails";
import NavBar from "../navbarComp/Navbar";
import Wave from "../animations/Wave";
import SearchLoader from "../animations/SearchLoader";
import styles from "./BatchLists.module.css";

export const BatchLists = () => {
  const loc = useLocation();
  const { apiUrl, cursorKey, title } = loc.state || {};
  const { cache, setCacheData } = useMusic();

  const [songs, setSongs] = useState(cache[apiUrl] || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(!!cursors[cursorKey]);

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const fetchSongsBatch = useCallback(async () => {
    if (loadingRef.current || !cursors[cursorKey]) return;

    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(
        `${Details.domain}${apiUrl}?cursor=${cursors[cursorKey]}`,
      );
      if (!res.ok) throw new Error("Unable to fetch");

      const data = await res.json();
      const newTracks = data.songs || [];

      setSongs((prev) => {
        const updated = [...prev, ...newTracks];
        setCacheData(apiUrl, updated);
        return updated;
      });

      if (cursorKey) {
        cursors[cursorKey] = data.nextCursor || "";
        setHasMore(!!data.nextCursor);
      }
    } catch (err) {
      console.error(err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [apiUrl, cursorKey]);

  // Initial load
  useEffect(() => {
    if (apiUrl && songs.length <= 10) {
      fetchSongsBatch();
    }
  }, [apiUrl]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          fetchSongsBatch();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, fetchSongsBatch]);

  return (
    <div className={styles.page}>
      <div className={styles.navbarWrapper}>
        <NavBar />
      </div>

      <div className={styles.content}>
        <div className={styles.waveWrapper}>
          <Wave />
        </div>

        <h1 className={styles.pageTitle}>{title || "Track Collection"}</h1>

        <div className={styles.trackCount}>
          {songs.length} {songs.length === 1 ? "track" : "tracks"}
        </div>

        <div className={styles.list}>
          {songs.map((song, index) => (
            <SongListItem
              key={`${song.id}-${index}`}
              songId={song.id}
              played={song.play_count}
              likes={song.likes_count}
              songName={song.title}
              sequnceApiUrl={apiUrl}
              currentIndex={index}
            />
          ))}
        </div>

        {/* Sentinel — sits just below the list; triggers fetch when visible */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {loading && (
          <div className={styles.loaderWrapper}>
            <SearchLoader />
          </div>
        )}

      </div>
    </div>
  );
};
