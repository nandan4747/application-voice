// CreatorDashboard.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { getCreatorSongs } from "../api/creatorFunctions";
import AnalysisCard from "./AnalysisCard";
import styles from "./CreatorDashboard.module.css";
import { BarChart3, TrendingUp, Plus } from "lucide-react";
import UploadModal from "./UploadModal";
import Toast from "../NotificationComp/Toast";

const CreatorDashboard = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type) => setToast({ message, type });

  const user = JSON.parse(localStorage.getItem("user"));
  const sentinelRef = useRef(null);

  const handleUploadSuccess = (newSong) => {
    setSongs((prev) => [newSong, ...prev]);
  };

  // Initial load
  useEffect(() => {
    const loadDashboard = async () => {
      if (user?.id) {
        const res = await getCreatorSongs(user.id);
        if (res.success) {
          setSongs(res.songs);
          setCursor(res.nextCursor || null);
          setHasMore(!!res.nextCursor);
        }
      }
      setLoading(false);
    };
    loadDashboard();
  }, []);

  // Load next page
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursor) return;

    setLoadingMore(true);
    const res = await getCreatorSongs(user.id, cursor);
    if (res.success) {
      setSongs((prev) => [...prev, ...res.songs]);
      setCursor(res.nextCursor || null);
      setHasMore(!!res.nextCursor);
    }
    setLoadingMore(false);
  }, [loadingMore, hasMore, cursor, user?.id]);

  // IntersectionObserver on sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]); // re-bind when loadMore changes (cursor/hasMore update)

  const totalPlays = songs.reduce((acc, s) => acc + s.play_count, 0);
  const totalLikes = songs.reduce((acc, s) => acc + s.likes_count, 0);

  if (loading)
    return <div className={styles.loading}>Scanning the charts...</div>;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1>Captain's Log: {user?.username}</h1>
          <p>Real-time performance of your studio</p>
        </div>
        <button className={styles.goldBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Upload Track
        </button>
      </header>

      <section className={styles.overview}>
        <div className={styles.statCard}>
          <TrendingUp color="#1db954" />
          <div>
            <h4>Total Plays</h4>
            <h2>{totalPlays.toLocaleString()}</h2>
          </div>
        </div>
        <div className={styles.statCard}>
          <BarChart3 color="#facc15" />
          <div>
            <h4>Total Likes</h4>
            <h2>{totalLikes.toLocaleString()}</h2>
          </div>
        </div>
      </section>

      <div className={styles.sectionTitle}>
        <h2>Your Tracks ({songs.length})</h2>
      </div>

      <div className={styles.songGrid}>
        {songs.length > 0 ? (
          songs.map((song) => (
            <AnalysisCard
              key={song.id}
              song={song}
              onToast={showToast}
              onDeleted={(id) =>
                setSongs((prev) => prev.filter((s) => s.id !== id))
              }
            />
          ))
        ) : (
          <div className={styles.empty}>
            No tracks found. Time to drop a beat?
          </div>
        )}
      </div>

      {/* Sentinel — watched by IntersectionObserver */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {loadingMore && (
        <div className={styles.loading}>Loading more tracks...</div>
      )}

      {!hasMore && songs.length > 0 && (
        <div className={styles.empty} style={{ marginTop: "1rem" }}>
          You've reached the end of your catalog
        </div>
      )}

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CreatorDashboard;
