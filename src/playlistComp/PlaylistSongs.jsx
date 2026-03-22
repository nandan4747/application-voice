import styles from "./PlaylistSongs.module.css";
import SongListSection from "../musicComponents/SongListSection";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PlaylistSongs = () => {
  const loc = useLocation();
  const nav = useNavigate();
  const playlistId = loc.state?.playlistId;
  const playlistName = loc.state?.playlistName ?? "Playlist";
  const imageUrl = `https://picsum.photos/seed/${playlistId + 200}/300/300`;

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* blurred ambient background */}
        <div
          className={styles.heroBg}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className={styles.heroOverlay} />

        {/* Cover art */}
        <div className={styles.coverWrapper}>
          <img
            src={imageUrl}
            alt={playlistName}
            className={styles.cover}
            draggable={false}
          />
        </div>

        {/* Meta */}
        <div className={styles.heroMeta}>
          <p className={styles.eyebrow}>Playlist</p>
          <h1 className={styles.playlistTitle}>{playlistName}</h1>
          <p className={styles.playlistMeta}>
            Your collection
            <span className={styles.metaDot} />
            Voice
          </p>
        </div>
      </section>

      {/* ── Track List ── */}
      <div className={styles.tracks}>
        <SongListSection
          apiUrl={`user/playlist/songs?playListId=${playlistId}`}
          title="Tracks"
        />
      </div>
    </div>
  );
};

export default PlaylistSongs;
