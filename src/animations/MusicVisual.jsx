import React from "react";
import Lottie from "react-lottie-player";
import lottieJson from "../assets/music_visualizer.json";

const MusicVisual = ({ isPlaying = true }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <Lottie
        loop
        animationData={lottieJson}
        play={isPlaying}
        style={{ width: 280 }}
        renderer="svg"
      />
    </div>
  );
};

export default MusicVisual;
