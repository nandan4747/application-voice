import React, { useEffect, useState } from "react";
import { getUserPlaylists, addSongToPlaylist } from "../api/playlistApi";
import styles from "./Playlist.module.css";
import SearchLoader from "../animations/SearchLoader";
import { X, Plus, ListMusic, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertDailog } from "../NotificationComp/AlertDailog";

const PlaylistDisplay = ({
  show = false,
  songId,
  setToast,
  onClose,
  onNewPlaylist,
  closeFromOutside,
}) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);

  const nav = useNavigate();
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "message",
    subHeading: "subHeading",
  });

  // Fetch playlists whenever modal opens
  useEffect(() => {
    if (!show) return;

    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const res = await getUserPlaylists(() => {
          setShowAlert({
            show: true,
            message:
              "Not a Registered user. you need to login in order to create a playlist. Redirecting to login page.",
            subHeading: "No account",
          });
        });
        if (res.success) setPlaylists(res.playlists);
      } catch {
        // fail silently — modal can retry on next open
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [show]);

  // Close on Escape
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, onClose]);

  const handleAddSong = async (playlistId) => {
    if (adding) return; // prevent double-tap
    setAdding(playlistId);
    try {
      const res = await addSongToPlaylist(playlistId, songId);
      if (res.success) {
        setToast("Added to playlist!", "success");
        onClose();
      } else {
        setToast(res.error || "Failed to add song.", "failure");
      }
    } catch {
      setToast("Network error. Please try again.", "failure");
    } finally {
      setAdding(null);
    }
  };

  if (!show) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeFromOutside();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.eyebrow}>Library</p>
            <h2 className={styles.title}>Your Playlists</h2>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.newBtn} onClick={onNewPlaylist}>
              <Plus size={13} strokeWidth={2.5} />
              New
            </button>
            <button
              className={styles.closeBtn}
              onClick={closeFromOutside}
              aria-label="Close"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingWrap}>
              <SearchLoader />
            </div>
          ) : playlists.length > 0 ? (
            playlists.map((pl) => (
              <div
                key={pl.id}
                className={styles.playlistCard}
                onClick={() => handleAddSong(pl.id)}
                style={{ opacity: adding && adding !== pl.id ? 0.45 : 1 }}
              >
                <div className={styles.cardLeft}>
                  <div className={styles.cardIcon}>
                    <ListMusic size={17} />
                  </div>
                  <div className={styles.cardInfo}>
                    <p className={styles.playlistName}>{pl.name}</p>
                    <p className={styles.playlistDate}>
                      {new Date(pl.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <PlusCircle
                  size={18}
                  className={styles.addIcon}
                  strokeWidth={1.5}
                />
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ListMusic size={20} />
              </div>
              <p className={styles.emptyTitle}>No playlists yet</p>
              <p className={styles.emptySubtitle}>
                Tap "New" to create your first one
              </p>
            </div>
          )}
        </div>
      </div>
      <div>
        {showAlert.show && (
          <AlertDailog
            message={showAlert.message}
            subHeading={showAlert.subHeading}
            onConfirm={() => {
              setShowAlert({
                show: false,
              });
              nav("/auth");
            }}
            onCancel={() => {
              setShowAlert({
                show: false,
              });
              closeFromOutside();
            }}
            wanToClosePlaying={false}
          />
        )}
      </div>
    </div>
  );
};

export default PlaylistDisplay;
