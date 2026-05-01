import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { searchSongs, fetchMoreByTags } from "../api/songFunctions";
import SongListItem from "../musicComponents/SongListItem";
import styles from "./SongListItem.module.css";
import NavBar from "../navbarComp/Navbar";
import SearchLoader from "../animations/SearchLoader";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const nextCursorRef = useRef(null);
  const tagsRef = useRef([]);
  const hasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false); // ← replaces loadingMore in the guard
  const sentinelRef = useRef(null);

  // ─── Initial search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!query) return;

    const performSearch = async () => {
      setLoading(true);
      setResults([]);
      nextCursorRef.current = null;
      tagsRef.current = [];
      hasMoreRef.current = false;

      const res = await searchSongs(query);

      if (res.success) {
        const raw = res.results;
        const meta = raw[raw.length - 1];
        const directSongs = raw.slice(0, -1);
        const relatedSongs = meta?.relatedSongs ?? [];

        setResults([...directSongs, ...relatedSongs]);

        tagsRef.current =
          directSongs.length > 0 && Array.isArray(directSongs[0].tags)
            ? directSongs[0].tags
            : query.trim().toLowerCase().split(/\s+/);

        nextCursorRef.current = meta?.nextCursor ?? null;
        console.log(nextCursorRef.current);
        hasMoreRef.current = !!meta?.nextCursor;
      }

      setLoading(false);
    };

    performSearch();
  }, [query]);

  // ─── Load next page ──────────────────────────────────────────────────────
  // Stable ref so the observer never needs to reconnect
  const loadMore = useRef(async () => {
    console.log("loading more");
    if (loadingMoreRef.current || !hasMoreRef.current || !nextCursorRef.current)
      return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    const res = await fetchMoreByTags(tagsRef.current, nextCursorRef.current);

    if (res.success) {
      setResults((prev) => [...prev, ...(res.results ?? [])]);
      nextCursorRef.current = res.nextCursor ?? null;
      hasMoreRef.current = !!res.nextCursor;
    }

    loadingMoreRef.current = false;
    setLoadingMore(false);
  }).current;

  // ─── IntersectionObserver — re-attaches after results render ─────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return; // still loading, skip

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [results]); // ← watch results, not []

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.navbarWrapper}>
        <NavBar />
      </div>

      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <p className={styles.eyebrow}>Search Results</p>
          <h2 className={styles.title}>"{query}"</h2>
          {!loading && results.length > 0 && (
            <p className={styles.resultCount}>
              {results.length} {results.length === 1 ? "track" : "tracks"} found
            </p>
          )}
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.loaderWrapper}>
              <SearchLoader />
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((song, index) => (
                <SongListItem
                  key={`${song.id}-${index}`}
                  songId={song.id}
                  songName={song.title}
                  played={song.play_count}
                  likes={song.likes_count}
                  currentIndex={index}
                />
              ))}

              <div
                ref={sentinelRef}
                style={{ height: "1px", marginTop: "8px" }}
              />

              {loadingMore && (
                <div className={styles.loaderWrapper}>
                  <SearchLoader />
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>♪</span>
              <p className={styles.emptyTitle}>No tracks found</p>
              <p className={styles.emptySubtext}>
                Try a different keyword or check your spelling.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
