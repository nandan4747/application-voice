import NavBar from "../navbarComp/Navbar";
import Styles from "./HomeStyle.module.css";
import { relation } from "../api/relationalGenre";
import SongGrid from "../musicComponents/SongGrid";
import SongListSection from "../musicComponents/SongListSection";
import { Outlet } from "react-router-dom";

import { useState } from "react";
const Home = () => {
  // eslint-disable-next-line no-unused-vars
  const [genre, setGenre] = useState(() => {
    return localStorage.getItem("genre") || "pop";
  });
  const relationalGenre = relation[genre];
  return (
    <div className={Styles.main}>
      {
        <div className={Styles.nav}>
          <NavBar></NavBar>
        </div>
      }
      <div className={Styles.player_overlay}>
        <Outlet />
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
          <SongGrid
            cursorKey="mostPlayed"
            seeMore={true}
            apiUrl={"user/mostplayed"}
            title={"Most played"}
          />
        }

        {
          //new songs by genre
          <SongListSection
            apiUrl={`user/songs/recent/genre?genre=${genre}`}
            title={`New Releases that you may like`}
          />
        }
        {
          // most liked songs

          <SongGrid apiUrl={"user/mostliked"} title={"Most Liked"} />
        }

        {
          //forgotten songs
          <SongListSection
            apiUrl={`user/songs/forgottenhits`}
            title={`Forgotten Hits`}
          />
        }

        <footer className={Styles.footer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff4747"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-circle-alert-icon lucide-circle-alert"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <p className={Styles.disclaimer}>
            This is a fun personal project for educational purposes. We do not
            promote or support music piracy. Please support artists by using
            official streaming services.
          </p>
        </footer>
      </div>
    </div>
  );
};
export default Home;
