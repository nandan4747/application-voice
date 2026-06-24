import styles from "./PlaylistSongs.module.css";
import { useLocation } from "react-router-dom";
import { useMusic } from "../MusicContext";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Details } from "../api/HostDetails";
import SongListItem from "../musicComponents/SongListItem";
import { cursors } from "../api/cursors";
import { art } from "../api/artProvider";

const PlaylistSongs = ({ cursorKey = "playlist" }) => {
  const loc = useLocation();
  const playlistId = loc.state?.playlistId;
  const playlistName = loc.state?.playlistName ?? "Playlist";
  //const imageUrl = `https://picsum.photos/seed/${playlistId + 200}/400/400`;
  const imageUrl = `https://loremflickr.com/200/200/music,abstract?lock=${playlistId +3000}`;
  const token = localStorage.getItem("token");
  //const apiUrl = `${Details.domain}user/playlist/songs?playListId=${playlistId}`;
  const apiUrl = art(playlistId).medium;

  const { cache, setCacheData } = useMusic();

  const cachedSongs = useMemo(() => cache[apiUrl] ?? null, [cache, apiUrl]);
  const [fetchedSongs, setFetchedSongs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const songs = cachedSongs ?? fetchedSongs;

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const fetchSongs = useCallback(
    async (cursor = null) => {
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      const fullUrl = cursor ? `${apiUrl}&cursor=${cursor}` : apiUrl;

      try {
        const res = await fetch(fullUrl, {
          headers: { Authorization: `Bearer ${token}` },
          method: "GET",
        });
        if (!res.ok) {
          console.error("Unable to fetch songs");
          return;
        }
        const result = await res.json();

        cursors[cursorKey] = result.nextCursor || null;
        setHasMore(!!cursors[cursorKey]);

        setFetchedSongs((prev) => {
          const current = cachedSongs ?? prev;
          const merged = [...current, ...result.songs];
          setCacheData(apiUrl, merged);
          return merged;
        });
      } catch (err) {
        console.error(err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [apiUrl, cursorKey, token, cachedSongs],
  );

  // Initial load
  useEffect(() => {
    if (cachedSongs) return;
    fetchSongs();
  }, [apiUrl, cachedSongs]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          fetchSongs(cursors[cursorKey]);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, fetchSongs]);

  const handleRemoveSong = async (songId, playListId) => {
    const url = `${Details.domain}user/playlist/song?playListId=${playListId}&songId=${songId}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error("Unable to remove song from playlist");
      return;
    }
    const updated = songs.filter((s) => s.id !== songId);
    setCacheData(apiUrl, updated);
    setFetchedSongs(updated);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div
          className={styles.heroBg}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.coverWrapper}>
          <img
            src={imageUrl}
            alt={playlistName}
            className={styles.cover}
            draggable={false}
          />
        </div>
        <div className={styles.heroMeta}>
          <p className={styles.eyebrow}>Playlist</p>
          <h1 className={styles.playlistTitle}>{playlistName}</h1>
          <p className={styles.playlistMeta}>
            Your collection
            <span className={styles.metaDot} />
            {songs.length} songs
          </p>
        </div>
      </section>

      <div className={styles.tracks}>
        <div className={styles.trackHeader}>
          <span className={styles.trackHeaderNum}>#</span>
          <span className={styles.trackHeaderTitle}>Title</span>
        </div>

        {songs.map((song, index) => (
          <div key={song.id} className={styles.trackRow}>
            <span className={styles.trackIndex}>{index + 1}</span>

            <SongListItem
              songId={song.id}
              currentIndex={index}
              sequnceApiUrl={apiUrl}
              songName={song.title}
              played={song.play_count}
              likes={song.likes_count}
            />

            <button
              className={styles.removeBtn}
              onClick={() => handleRemoveSong(song.id, playlistId)}
              title="Remove from playlist"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 11v6M14 11v6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        ))}

        {/* Sentinel triggers next fetch when scrolled into view */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {loading && (
          <div className={styles.loadMoreWrapper}>
            <span className={styles.loadDot} />
            <span className={styles.loadDot} />
            <span className={styles.loadDot} />
          </div>
        )}

        {!hasMore && songs.length > 0 && (
          <div style={{ justifySelf: "center" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-book-open-check-icon lucide-book-open-check"
            >
              <path d="M12 21V7" />
              <path d="m16 12 2 2 4-4" />
              <path d="M22 6V4a1 1 0 0 0-1-1h-5a4 4 0 0 0-4 4 4 4 0 0 0-4-4H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6a1 1 0 0 0 1-1v-1.3" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistSongs;
