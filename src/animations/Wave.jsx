import React from "react";
import Lottie from "react-lottie-player";
import lottieJson from "../assets/arrowsicon.json";

const Wave = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <Lottie
        loop
        animationData={lottieJson}
        play
        style={{ width: 150 }}
        // Performance trick: Use 'canvas' for complex animations, 'svg' for simple ones
        renderer="svg"
      />
    </div>
  );
};

export default Wave;
