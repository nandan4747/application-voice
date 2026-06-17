import React, { createContext, useState, useContext } from "react";

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [cache, setCache] = useState({});

  const [currentSongId, setCurrentSongId] = useState(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);

  const playTrack = (id) => {
    setCurrentSongId(id);
    setIsPlayerMinimized(false);
  };

  const closePlayer = () => {
    setCurrentSongId(null);
  };

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
