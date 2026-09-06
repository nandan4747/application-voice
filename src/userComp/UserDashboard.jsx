import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { handleDeleteAccount } from "../api/authFunctions";
import CreatePlaylistModal from "../playlistComp/CreatePlaylistModal";

import {
  Home,
  Plus,
  User,
  Lock,
  ListMusic,
  Heart,
  Music2,
  Trash2,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";
import styles from "./UserDashboard.module.css";
import { Details } from "../api/HostDetails";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext.jsx";
import { UpdatePasswordForm } from "../forms/UpdatePasswordFrom";
import { useMusic } from "../MusicContext";
import { AlertDailog } from "../NotificationComp/AlertDailog.jsx";

const MENU_OPTIONS = [
  { id: "home", label: "Home", icon: <Home size={17} /> },
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
const STALE_5MIN = 5 * 60 * 1000;

/* ── Helpers ── */
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const fetchUser = async () => {
  const res = await fetch(`${Details.domain}user/details`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error("Unauthorized");
  }
  return res.json();
};

const fetchLiked = async () => {
  const res = await fetch(`${Details.domain}user/songs/liked`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load liked songs");
  return res.json(); // { songs, nextCursor }
};

const fetchPlaylists = async () => {
  const res = await fetch(`${Details.domain}user/playlists`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load playlists");
  return res.json(); // { playlists }
};

/* ── Skeleton / Empty ── */
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

const Empty = ({ icon, title, subtitle }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>{icon}</div>
    <p className={styles.emptyTitle}>{title}</p>
    <p className={styles.emptySubtitle}>{subtitle}</p>
  </div>
);

/* ── Component ── */
const UserDashboard = () => {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { playTrack } = useMusic();

  const [activeTab, setActiveTab] = useState("userInfo");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeGenre, setActiveGenre] = useState(
    () => localStorage.getItem("genre") || "",
  );

  // ── Infinite-scroll state (local only — extra pages aren't cached) ──
  const [extraFavorites, setExtraFavorites] = useState([]);
  const [likedCursor, setLikedCursor] = useState(null);
  const [hasMoreLiked, setHasMoreLiked] = useState(true);
  const [loadingMoreLiked, setLoadingMoreLiked] = useState(false);
  const likedSentinelRef = useRef(null);
  const [showAlertDailog, setShowAlertDalog] = useState(false);
  const [alertDailogConfig, setAlertDailogConfig] = useState({
    message: "message",
    subHeading: "sub heading",
  });

  const { addNotification } = useNotification();

  const token = localStorage.getItem("token");

  /* ── Queries ── */
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: STALE_5MIN,
    retry: false,
  });

  useEffect(() => {
    if (userQuery.isError) {
      nav("/auth");
    }
  }, [userQuery.isError]);
  // Replace the likedQuery block and the cursor useEffect

  const likedQuery = useQuery({
    queryKey: ["liked"],
    queryFn: fetchLiked,
    enabled: !!token && userQuery.isSuccess,
  });

  // ── Seed cursor whenever the first page loads (replaces removed onSuccess) ──
  useEffect(() => {
    if (!likedQuery.data) return;
    setLikedCursor(likedQuery.data.nextCursor || null);
    setHasMoreLiked(!!likedQuery.data.nextCursor);
    setExtraFavorites([]); // reset extras if query re-ran
  }, [likedQuery.data]);

  const playlistsQuery = useQuery({
    queryKey: ["playlists"],
    queryFn: fetchPlaylists,
    staleTime: STALE_5MIN,
    enabled: !!token && userQuery.isSuccess,
  });

  /* ── Redirect if no token ── */
  useEffect(() => {
    if (!token) nav("/auth");
  }, [token]);

  /* ── Derived data ── */
  const userData = userQuery.data || { username: "", email: "", role: "" };
  const playlists = playlistsQuery.data?.playlists || [];
  const favorites = [...(likedQuery.data?.songs || []), ...extraFavorites];
  const isCreator = userData.role === "creator";
  const loading =
    userQuery.isLoading || likedQuery.isLoading || playlistsQuery.isLoading;

  /* ── Infinite scroll ── */
  const loadMoreLiked = useCallback(async () => {
    if (loadingMoreLiked || !hasMoreLiked || !likedCursor) return;
    setLoadingMoreLiked(true);

    const url = new URL(`${Details.domain}user/songs/liked`);
    url.searchParams.set("cursor", likedCursor);
    const res = await fetch(url.toString(), { headers: authHeaders() });

    if (res.ok) {
      const data = await res.json();
      setExtraFavorites((prev) => [...prev, ...(data.songs || [])]);
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
      ([e]) => {
        if (e.isIntersecting) loadMoreLiked();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, loadMoreLiked]);

  const onAlertSuccess = async () => {
    /*
    alert("message sent successfully!");
    setShowAlertDalog(false);

     */
    await handleDeleteAccount(() => nav("/auth"));
  };
  const onAlertCancel = () => {
    setShowAlertDalog(false);
  };
  /* ── Tab content ── */
  const renderContent = () => {
    if (loading) return <Skeleton />;

    switch (activeTab) {
      case "home":
        return nav("/");
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
                      <span className={styles.statusDot} /> Active
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
                  <Plus size={15} /> New Playlist
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
                // Bust the cache → React Query re-fetches automatically
                queryClient.invalidateQueries({ queryKey: ["playlists"] });
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

            {/* ── favorites-specific loading ── */}
            {likedQuery.isLoading ? (
              <Skeleton />
            ) : favorites.length > 0 ? (
              <>
                <div className={styles.songList}>
                  {favorites.map((song, i) => (
                    <div
                      key={song.id}
                      className={styles.songRow}
                      onClick={() => playTrack(song.id)}
                    >
                      <span className={styles.songIndex}>{i + 1}</span>
                      <Heart size={14} fill="#ef4444" color="#ef4444" />
                      <div className={styles.songInfo}>
                        <p className={styles.songName}>{song.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                    addNotification(`preference changes to ${g}`);
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
      <div></div>
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
        <div className={styles.mobileTabHolder}>
          <div className={styles.mobileTab}>
            {MENU_OPTIONS.map((option) => {
              if (option.id === "home") return;
              return (
                <div
                  id={option.id}
                  onClick={() => setActiveTab(option.id)}
                  className={
                    activeTab === option.id ? styles.activeMobileTabOption : ""
                  }
                >
                  {option.icon}
                </div>
              );
            })}
          </div>
        </div>

        {isCreator && (
          <button className={styles.studioBtn} onClick={() => nav("/studio")}>
            <Zap size={14} /> Admin Studio
          </button>
        )}
        <div className={styles.sidebarFooter}>
          <button
            className={styles.deleteBtn}
            //onClick={() => handleDeleteAccount(() => nav("/auth"))}
            onClick={() => {
              setAlertDailogConfig({
                message: "this action cannot be undone .",
                subHeading: "Account is going to be deleted",
              });
              setShowAlertDalog(true);
            }}
          >
            <Trash2 size={16} /> Delete Account
          </button>
          <button
            className={styles.logoutBtn}
            onClick={() => {
              localStorage.setItem("isLoggedIn", "no");
              localStorage.setItem("token", "");
              // Clear all cached queries on logout
              queryClient.clear();
              nav("/auth");
            }}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>{renderContent()}</main>

      {showAlertDailog && (
        <div
          style={{
            zIndex: 999,
            position: "fixed",
          }}
        >
          <AlertDailog
            message={alertDailogConfig.message}
            subHeading={alertDailogConfig.subHeading}
            onConfirm={onAlertSuccess}
            onCancel={onAlertCancel}
          ></AlertDailog>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
