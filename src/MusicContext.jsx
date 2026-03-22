import React, { createContext, useState, useContext } from "react";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [cache, setCache] = useState({}); // { "user/songs/recent": [...] }

  const setCacheData = (key, data) => {
    setCache((prev) => ({ ...prev, [key]: data }));
  };

  return (
    <MusicContext.Provider value={{ cache, setCacheData }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
