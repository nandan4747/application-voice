import React, { useState } from "react";
import styles from "./CollageCard.module.css";
import { art } from "../api/artProvider";

const PALETTE = [
  "#df15fa",
  "#7c3aed",
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
];
const colorFor = (id) => {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const MosaicTile = ({ song, index }) => {
  const [loaded, setLoaded] = useState(false);
  const { medium } = art(song.id);

  return (
    <div
      className={styles.mosaicTile}
      style={{
        background: colorFor(song.id),
        animationDelay: `${index * 0.06}s`,
      }}
    >
      <img
        src={medium}
        alt=""
        loading="lazy"
        className={`${styles.tileImg} ${loaded ? styles.tileImgLoaded : ""}`}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <span className={styles.initial}>
          {song.title?.charAt(0)?.toUpperCase() || "♪"}
        </span>
      )}
    </div>
  );
};

const CollageCard = ({ songs = [], onClick, width }) => {
  const tiles = songs.slice(0, 4);
  const remaining = songs.length;
  const backdropKey = songs[0]?.id;
  const backdropUrl = backdropKey ? art(backdropKey).larg : null;

  return (
    <div
      className={styles.collageCard}
      style={width ? { width } : undefined}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
    >
      <div className={styles.mosaic}>
        {backdropUrl && (
          <div
            className={styles.backdrop}
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        )}

        <div className={styles.grid}>
          {tiles.map((song, index) => (
            <MosaicTile key={song.id} song={song} index={index} />
          ))}
          {Array.from({ length: Math.max(4 - tiles.length, 0) }).map((_, i) => (
            <div key={`empty-${i}`} className={styles.mosaicTileEmpty} />
          ))}
        </div>

        <div className={styles.overlay}>
          <span className={styles.count}>+{remaining}</span>
          <span className={styles.countLabel}>more</span>
        </div>
      </div>
      <p className={styles.collageTitle}>More tracks</p>
      <p className={styles.collageSub}>Tap to view all</p>
    </div>
  );
};

export default CollageCard;
