import React, { createContext, useState, useContext } from "react";

// 1. Create the Context (The "Phone Line")
const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentSong = queue[currentIndex] || null;

  return (
    // 2. Pass EVERYTHING you need into the value
    <PlayerContext.Provider
      value={{
        queue,
        setQueue,
        currentIndex,
        setCurrentIndex,
        currentSong,
        playNext,
        playPrevious,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

// 3. Export the Custom Hook (The "Handset")
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error(
      "usePlayer must be used within a PlayerProvider. Don't forget to wrap your App, homie.",
    );
  }
  return context;
};
