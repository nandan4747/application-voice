import React, { useEffect, useState } from "react";
import { getCreatorSongs } from "../api/creatorFunctions";
import AnalysisCard from "./AnalysisCard";
import styles from "./CreatorDashboard.module.css";
import { BarChart3, TrendingUp, Plus } from "lucide-react"; // Added Plus icon
import UploadModal from "./UploadModal";

const CreatorDashboard = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUploadSuccess = (newSong) => {
  
    setSongs((prev) => [newSong, ...prev]);
  };

  useEffect(() => {
    const loadDashboard = async () => {
      if (user?.id) {
        const res = await getCreatorSongs(user.id);
        if (res.success) setSongs(res.songs);
      }
      setLoading(false);
    };
    loadDashboard();
  }, []);

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

        {/* FIX 1: The Trigger Button */}
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
          songs.map((song) => <AnalysisCard key={song.id} song={song} />)
        ) : (
          <div className={styles.empty}>
            No tracks found. Time to drop a beat?
          </div>
        )}
      </div>
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default CreatorDashboard;
