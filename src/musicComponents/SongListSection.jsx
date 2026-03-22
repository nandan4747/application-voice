import React, { useState, useEffect } from "react";
import SongListItem from "./SongListItem";
import styles from "./SongListSection.module.css";
import { Details } from "../api/HostDetails";
import { useMusic } from "../MusicContext";
const SongListSection = ({ title, apiUrl }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cache, setCacheData } = useMusic();
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        if (cache[apiUrl]) {
          setSongs(cache[apiUrl]);
          setLoading(false);
          return;
        }
        const fullUrl = `${Details.domain}${apiUrl}`;
        const response = await fetch(fullUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          setSongs(data.songs || []);
          setCacheData(apiUrl, data.songs);
        } else {
          console.error("Fetch failed with status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (apiUrl) fetchSongs();
  }, [apiUrl]);

  return (
    <div className={styles.sectionWrapper}>
      {title && <h2 className={styles.sectionTitle}>{title}</h2>}

      <div className={styles.listContainer}>
        {loading ? (
          <p className={styles.statusText}>Tuning the instruments...</p>
        ) : songs.length > 0 ? (
          songs.map((song, index) => (
            <SongListItem
              key={song.id}
              songId={song.id}
              songName={song.title}
              sequnceApiUrl={apiUrl}
              currentIndex={index}
            />
          ))
        ) : (
          <p className={styles.statusText}>
            The silence is deafening. No songs found.
          </p>
        )}
      </div>
    </div>
  );
};

export default SongListSection;
