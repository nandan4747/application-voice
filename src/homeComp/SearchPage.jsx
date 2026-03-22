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
    <div className={styles.main}>
      <div className={styles.header}>
        <NavBar />
      </div>
      <div className={styles.container}>
        <h2 className={styles.title}>Results for: "{query}"</h2>
        <div className={styles.list}>
          {loading ? (
            <SearchLoader></SearchLoader>
          ) : results.length > 0 ? (
            results.map((song) => (
              <SongListItem
                key={song.id}
                songId={song.id}
                songName={song.title}
              />
            ))
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "red",
              }}
            >
              No tracks found...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
