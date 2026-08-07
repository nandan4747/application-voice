import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import SongCard from "../musicComponents/SongCard";
import CollageCard from "../musicComponents/CollageCard";
import styles from "./SongGrid.module.css";
import { Details } from "../api/HostDetails";
import { useMusic } from "../MusicContext";
import { cursors } from "../api/cursors";
import { useNavigate } from "react-router-dom";

const SKELETON_COUNT = 6;
const CARD_WIDTH_FALLBACK = 175;
const GAP_FALLBACK = 14;

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

const SongGrid = ({ title, apiUrl, seeMore = false, cursorKey = "" }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cache, setCacheData } = useMusic();
  const [hasMore, setHasMore] = useState(true);
  const nav = useNavigate();

  const containerRef = useRef(null);
  const [columns, setColumns] = useState(0);
  const [cardWidth, setCardWidth] = useState(null);

  const fetchSongs = async () => {
    setLoading(true);
    try {
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

  // How many cards actually fit in the row, read straight off the
  // --card-w / --gap custom properties so it stays in sync with CSS
  // (including any responsive breakpoints you add later).
  const recomputeColumns = useCallback(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const cs = getComputedStyle(containerEl);
    const width =
      parseFloat(cs.getPropertyValue("--card-w")) || CARD_WIDTH_FALLBACK;
    const gap = parseFloat(cs.getPropertyValue("--gap")) || GAP_FALLBACK;
    const availableWidth = containerEl.clientWidth;

    const cols = Math.max(
      Math.floor((availableWidth + gap) / (width + gap)),
      1,
    );
    setColumns(cols);
    setCardWidth(width);
  }, []);

  useLayoutEffect(() => {
    recomputeColumns();
  }, [songs, recomputeColumns]);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const ro = new ResizeObserver(() => recomputeColumns());
    ro.observe(containerEl);
    return () => ro.disconnect();
  }, [recomputeColumns]);

  const overflowing = columns > 0 && songs.length > columns;

  // Force a minimum of 1 visible song card so they don't go extinct on small screens
  const maxVisible = Math.max(columns - 1, 1);

  const visibleSongs = overflowing ? songs.slice(0, maxVisible) : songs;
  const collageSongs = overflowing ? songs.slice(maxVisible) : [];

  const goToFullList = () => {
    nav("/batchplay", { state: { apiUrl, cursorKey } });
  };

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
        <div className={styles.scrollRow} ref={containerRef}>
          {visibleSongs.map((song, index) => (
            <div key={song.id} className={styles.cardWrapper}>
              <SongCard
                songId={song.id}
                songName={song.title}
                sequnceApiUrl={apiUrl}
                currentIndex={index}
                played={song.play_count}
                likes={song.likes_count}
              />
            </div>
          ))}

          {overflowing && (
            <div className={styles.cardWrapper}>
              <CollageCard
                songs={collageSongs}
                onClick={goToFullList}
                width={cardWidth ? `${cardWidth}px` : undefined}
              />
            </div>
          )}

          {!overflowing && seeMore && hasMore && (
            <div className={styles.seeMoreWrapper} onClick={goToFullList}>
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
