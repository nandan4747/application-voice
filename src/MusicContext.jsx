import React, { createContext, useState, useContext, useCallback } from "react";

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [cache, setCache] = useState({});

  const [currentSongId, setCurrentSongId] = useState(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);

  const playTrack = useCallback((id) => {
    setCurrentSongId(id);
    setIsPlayerMinimized(false);
  }, []);

  const closePlayer = useCallback(() => {
    setCurrentSongId(null);
  }, []);

  const setCacheData = (key, data) => {
    setCache((prev) => ({ ...prev, [key]: data }));
  };

  return (
    <MusicContext.Provider
      value={{
        cache,
        setCache,
        setCacheData,
        currentSongId,
        isPlayerMinimized,
        setIsPlayerMinimized,
        playTrack,
        closePlayer,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};
