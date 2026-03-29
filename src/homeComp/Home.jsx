import NavBar from "../navbarComp/Navbar";
import Styles from "./HomeStyle.module.css";
import { relation } from "../api/relationalGenre";
import SongGrid from "../musicComponents/SongGrid";
import SongListSection from "../musicComponents/SongListSection";

import { useState } from "react";
const Home = () => {
  // eslint-disable-next-line no-unused-vars
  const [genre, setGenre] = useState(() => {
    return localStorage.getItem("genre") || "pop";
  });
  const relationalGenre = relation[genre];
  return (
    <div className={Styles.main}>
      <div className={Styles.nav}>
        <NavBar></NavBar>
      </div>
      <div className={Styles.contents}>
        {
          // recently uploaded
          <SongGrid
            cursorKey="recent"
            seeMore={true}
            apiUrl={"user/songs/recent"}
            title={"New Releases"}
          />
        }

        {genre && (
          <div className={Styles.genre_holder}>
            <SongListSection
              apiUrl={`user/recommendation?genre=${genre}`}
              title={"For You"}
            />
            <SongListSection
              apiUrl={`user/recommendation?genre=${relationalGenre}`}
              title={"You may Like these ;)"}
            ></SongListSection>
          </div>
        )}
        {
          // most played
        }

        <SongGrid
          cursorKey="mostPlayed"
          seeMore={true}
          apiUrl={"user/mostplayed"}
          title={"Most played"}
        />
        {
          // most liked songs
          <SongGrid apiUrl={"user/mostliked"} title={"Most Liked"} />
        }
      </div>
    </div>
  );
};
export default Home;
