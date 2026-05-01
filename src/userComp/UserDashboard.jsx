import React, { useState, useEffect, useCallback, useRef } from "react";
import { handleDeleteAccount } from "../api/authFunctions";
import CreatePlaylistModal from "../playlistComp/CreatePlaylistModal";
import { Plus } from "lucide-react";
import {
  User,
  Lock,
  ListMusic,
  Heart,
  Music2,
  Trash2,
  LogOut,
  ChevronRight,
  Zap,
  Music,
} from "lucide-react";
import styles from "./UserDashboard.module.css";
import { Details } from "../api/HostDetails";
import { useNavigate } from "react-router-dom";
import Toast from "../NotificationComp/Toast";
import { UpdatePasswordForm } from "../forms/UpdatePasswordFrom";

const MENU_OPTIONS = [
  { id: "userInfo", label: "Profile", icon: <User size={17} /> },
  { id: "updatePassword", label: "Security", icon: <Lock size={17} /> },
  { id: "playlists", label: "Playlists", icon: <ListMusic size={17} /> },
  { id: "favorites", label: "Liked Songs", icon: <Heart size={17} /> },
  { id: "genres", label: "Genres", icon: <Music2 size={17} /> },
];

const GENRES = [
  "pop",
  "anime",
  "rock",
  "romance",
  "classic",
  "sad",
  "epic",
  "melody",
  "phonk",
];

/* ── Skeleton loader ── */
const Skeleton = () => (
  <div className={styles.skeletonContainer}>
    {[80, 55, 70, 40].map((w, i) => (
      <div
        key={i}
        className={styles.skeletonLine}
        style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

/* ── Empty state ── */
const Empty = ({ icon, title, subtitle }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>{icon}</div>
    <p className={styles.emptyTitle}>{title}</p>
    <p className={styles.emptySubtitle}>{subtitle}</p>
  </div>
);

const UserDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("userInfo");
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [activeGenre, setActiveGenre] = useState(
    () => localStorage.getItem("genre") || "",
  );

  const [favorites, setFavorites] = useState([]);
  const [likedCursor, setLikedCursor] = useState(null);
  const [hasMoreLiked, setHasMoreLiked] = useState(true);
  const [loadingMoreLiked, setLoadingMoreLiked] = useState(false);
  const likedSentinelRef = useRef(null); // add useRef to imports

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return nav("/auth");

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const base = `${Details.domain}user`;

        const [userRes, likedRes, playRes] = await Promise.all([
          fetch(`${base}/details`, { headers }),
          fetch(`${base}/songs/liked`, { headers }),
          fetch(`${base}/playlists`, { headers }),
        ]);

        if (userRes.ok) {
          const u = await userRes.json();
          setUserData(u);
          if (u.role === "creator") setIsCreator(true);
        } else {
          return nav("/auth");
        }
        if (likedRes.ok) {
          const l = await likedRes.json();
          setFavorites(l.songs || []);
          setLikedCursor(l.nextCursor || null);
          setHasMoreLiked(!!l.nextCursor);
        }
        if (playRes.ok) {
          const p = await playRes.json();
          setPlaylists(p.playlists || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const loadMoreLiked = useCallback(async () => {
    if (loadingMoreLiked || !hasMoreLiked || !likedCursor) return;

    setLoadingMoreLiked(true);
    const token = localStorage.getItem("token");

    const url = new URL(`${Details.domain}user/songs/liked`);
    url.searchParams.set("cursor", likedCursor);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setFavorites((prev) => [...prev, ...(data.songs || [])]);
      setLikedCursor(data.nextCursor || null);
      setHasMoreLiked(!!data.nextCursor);
    }

    setLoadingMoreLiked(false);
  }, [loadingMoreLiked, hasMoreLiked, likedCursor]);

  useEffect(() => {
    if (activeTab !== "favorites") return;
    const sentinel = likedSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreLiked();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, loadMoreLiked]);

  const showToast = (message, type = "success") =>
    setToast({ show: true, message, type });

  const renderContent = () => {
    if (loading) return <Skeleton />;

    switch (activeTab) {
      case "userInfo":
        return (
          <>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Account</p>
              <h2 className={styles.sectionTitle}>Your Profile</h2>
            </div>
            <div className={styles.infoCard}>
              {[
                { label: "Nick Name", value: userData.username || "—" },
                { label: "username", value: userData.email || "—" },
                {
                  label: "Status",
                  value: (
                    <span className={styles.statusBadge}>
                      <span className={styles.statusDot} />
                      Active
                    </span>
                  ),
                },
                {
                  label: "Role",
                  value: userData.role
                    ? userData.role.charAt(0).toUpperCase() +
                      userData.role.slice(1)
                    : "Listener",
                },
              ].map(({ label, value }) => (
                <div className={styles.infoRow} key={label}>
                  <p className={styles.infoLabel}>{label}</p>
                  <p className={styles.infoValue}>{value}</p>
                </div>
              ))}
            </div>
          </>
        );

      case "updatePassword":
        return (
          <>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Security</p>
              <h2 className={styles.sectionTitle}>Update Password</h2>
            </div>
            <UpdatePasswordForm />
          </>
        );

      case "playlists":
        return (
          <>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderRow}>
                <div>
                  <p className={styles.eyebrow}>Library</p>
                  <h2 className={styles.sectionTitle}>Your Playlists</h2>
                </div>
                <button
                  className={styles.newPlaylistBtn}
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={15} />
                  New Playlist
                </button>
              </div>
            </div>

            {playlists.length > 0 ? (
              <div className={styles.grid}>
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className={styles.itemCard}
                    onClick={() =>
                      nav("/playlist", {
                        state: { playlistId: pl.id, playlistName: pl.name },
                      })
                    }
                  >
                    <div className={styles.playlistIcon}>
                      <ListMusic size={17} />
                    </div>
                    <h4>{pl.name}</h4>
                    <p className={styles.itemMeta}>Playlist</p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                icon={<ListMusic size={22} />}
                title="No playlists yet"
                subtitle="Create your first playlist to get started"
              />
            )}

            <CreatePlaylistModal
              show={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                // Re-fetch playlists so the new one appears immediately
                const token = localStorage.getItem("token");
                fetch(`${Details.domain}user/playlists`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                  .then((r) => r.json())
                  .then((p) => setPlaylists(p.playlists || []))
                  .catch(console.error);
              }}
            />
          </>
        );

      case "favorites":
        return (
          <>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Collection</p>
              <h2 className={styles.sectionTitle}>Liked Songs</h2>
            </div>
            {favorites.length > 0 ? (
              <>
                <div className={styles.songList}>
                  {favorites.map((song, i) => (
                    <div
                      key={song.id}
                      className={styles.songRow}
                      onClick={() => nav(`/play/${song.id}`)}
                    >
                      <span className={styles.songIndex}>{i + 1}</span>
                      <Heart size={14} fill="#ef4444" color="#ef4444" />
                      <div className={styles.songInfo}>
                        <p className={styles.songName}>{song.title}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sentinel */}
                <div ref={likedSentinelRef} style={{ height: 1 }} />

                {loadingMoreLiked && (
                  <p className={styles.emptySubtitle}>Loading more...</p>
                )}
                {!hasMoreLiked && (
                  <p
                    className={styles.emptySubtitle}
                    style={{ textAlign: "center", marginTop: "1rem" }}
                  >
                    You've liked {favorites.length} songs 🎵
                  </p>
                )}
              </>
            ) : (
              <Empty
                icon={<Heart size={22} />}
                title="No liked songs"
                subtitle="Songs you like will appear here"
              />
            )}
          </>
        );

      case "genres":
        return (
          <>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>Preferences</p>
              <h2 className={styles.sectionTitle}>Preferred Genre</h2>
            </div>
            <div className={styles.genreGrid}>
              {GENRES.map((g) => (
                <button
                  key={g}
                  className={`${styles.chip} ${activeGenre === g ? styles.chipActive : ""}`}
                  onClick={() => {
                    localStorage.setItem("genre", g);
                    setActiveGenre(g);
                    showToast(`Recommendations set to ${g}`);
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <nav className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Dashboard</h3>
          <p className={styles.sidebarSubtitle}>Voice</p>
        </div>

        <ul className={styles.menuList}>
          {MENU_OPTIONS.map((opt) => (
            <li
              key={opt.id}
              className={activeTab === opt.id ? styles.activeItem : ""}
              onClick={() => setActiveTab(opt.id)}
            >
              {opt.icon}
              <span className={styles.menuLabel}>{opt.label}</span>
              {activeTab === opt.id && <ChevronRight size={14} />}
            </li>
          ))}
        </ul>

        {isCreator && (
          <button className={styles.studioBtn} onClick={() => nav("/studio")}>
            <Zap size={14} /> Admin Studio
          </button>
        )}

        <div className={styles.sidebarFooter}>
          <button
            className={styles.deleteBtn}
            onClick={() => handleDeleteAccount(() => nav("/auth"))}
          >
            <Trash2 size={16} /> Delete Account
          </button>
          <button
            className={styles.logoutBtn}
            onClick={() => {
              localStorage.setItem("isLoggedIn", "no");
              localStorage.setItem("token", "");
              nav("/auth");
            }}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>{renderContent()}</main>

      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default UserDashboard;
