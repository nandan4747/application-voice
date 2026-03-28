import { useMusic } from "../MusicContext";
import { cursors } from "../api/cursors";
import { useState, useEffect } from "react";
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

  const fetchSongsBatch = async () => {
    if (loading || !cursors[cursorKey]) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${Details.domain}${apiUrl}?cursor=${cursors[cursorKey]}`,
      );
      if (!res.ok) throw new Error("Unable to fetch");

      const data = await res.json();
      const newTracks = data.songs || [];
      const updatedList = [...songs, ...newTracks];

      setSongs(updatedList);
      setCacheData(apiUrl, updatedList);

      if (cursorKey) {
        cursors[cursorKey] = data.nextCursor || "";
        setHasMore(!!data.nextCursor);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl && songs.length <= 10) {
      fetchSongsBatch();
    }
  }, [apiUrl]);

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
              songName={song.title}
              sequnceApiUrl={apiUrl}
              currentIndex={index}
            />
          ))}
        </div>

        {loading && (
          <div className={styles.loaderWrapper}>
            <SearchLoader />
          </div>
        )}

        {hasMore && !loading && (
          <div className={styles.loadMoreWrapper}>
            <button
              className={styles.loadMoreBtn}
              onClick={fetchSongsBatch}
              disabled={loading}
            >
              <span className={styles.loadMoreLabel}>Load More</span>
              <svg
                className={styles.loadMoreIcon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="5" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="19" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
