import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchSongs } from "../api/songFunctions";
import SongListItem from "../musicComponents/SongListItem";
import styles from "./SongListItem.module.css";
import NavBar from "../navbarComp/Navbar";
import SearchLoader from "../animations/SearchLoader";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      setLoading(true);
      const res = await searchSongs(query);
      if (res.success) setResults(res.results);
      setLoading(false);
    };
    performSearch();
  }, [query]);

  return (
    <div className={styles.page}>
      <div className={styles.navbarWrapper}>
        <NavBar />
      </div>

      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <p className={styles.eyebrow}>Search Results</p>
          <h2 className={styles.title}>"{query}"</h2>
          {!loading && results.length > 0 && (
            <p className={styles.resultCount}>
              {results.length} {results.length === 1 ? "track" : "tracks"} found
            </p>
          )}
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.loaderWrapper}>
              <SearchLoader />
            </div>
          ) : results.length > 0 ? (
            results.map((song, index) => (
              <SongListItem
                key={song.id}
                songId={song.id}
                songName={song.title}
                currentIndex={index}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>♪</span>
              <p className={styles.emptyTitle}>No tracks found</p>
              <p className={styles.emptySubtext}>
                Try a different keyword or check your spelling.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
