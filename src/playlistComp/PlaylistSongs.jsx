import styles from "./PlaylistSongs.module.css";
import { useLocation } from "react-router-dom";
import { useMusic } from "../MusicContext";
import { useState, useEffect, useMemo } from "react";
import { Details } from "../api/HostDetails";
import SongListItem from "../musicComponents/SongListItem";

const PlaylistSongs = () => {
  const loc = useLocation();
  const playlistId = loc.state?.playlistId;
  const playlistName = loc.state?.playlistName ?? "Playlist";
  const imageUrl = `https://picsum.photos/seed/${playlistId + 200}/300/300`;
  const token = localStorage.getItem("token");
  const apiUrl = `${Details.domain}user/playlist/songs?playListId=${playlistId}`;

  const { cache, setCacheData } = useMusic();

  const cachedSongs = useMemo(() => cache[apiUrl] ?? null, [cache, apiUrl]);
  const [fetchedSongs, setFetchedSongs] = useState([]);
  const [nextCursor, setNextCursor] = useState(null); // ✅ local, per-playlist
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const songs = cachedSongs ?? fetchedSongs;

  // Shared fetch logic — appends to existing songs
  const fetchSongs = async (cursor = null) => {
    setLoading(true);
    const fullUrl = cursor ? `${apiUrl}&cursor=${cursor}` : apiUrl;

    const res = await fetch(fullUrl, {
      headers: { Authorization: `Bearer ${token}` },
      method: "GET",
    });
    if (!res.ok) {
      console.error("Unable to fetch songs");
      setLoading(false);
      return;
    }
    const result = await res.json();
    const newCursor = result.nextCursor || null;
    setNextCursor(newCursor);
    setHasMore(!!newCursor); // no nextCursor = no more pages

    const current = cachedSongs ?? fetchedSongs;
    const merged = [...current, ...result.songs];
    setCacheData(apiUrl, merged);
    setFetchedSongs(merged);
    setLoading(false);
  };

  useEffect(() => {
    if (cachedSongs) return;
    console.log("fetching");
    fetchSongs();
  }, [apiUrl, cachedSongs]);

  // Load more button handler
  const handleLoadMore = () => {
    if (nextCursor && !loading) fetchSongs(nextCursor);
  };

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

        {hasMore && (
          <div className={styles.loadMoreWrapper}>
            <button
              className={styles.loadMore}
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.loadDot} />
                  <span className={styles.loadDot} />
                  <span className={styles.loadDot} />
                </>
              ) : (
                "Load more"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistSongs;
