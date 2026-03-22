import "./App.css";
import PlayerPage from "./musicComponents/PlayerPage";
import { Routes, Route } from "react-router-dom";
import Home from "./homeComp/Home";
import AuthPage from "./forms/AuthPage";
import CreatorAuth from "./forms/CreatorAuth";
import CreatorDashboard from "./creatorComp/CreatorDashboard";
import UploadModal from "./creatorComp/UploadModal";
import SearchPage from "./homeComp/SearchPage";
import { MusicProvider } from "./MusicContext";
import CreatePlaylistModal from "./playlistComp/CreatePlaylistModal";
import PlaylistDisplay from "./playlistComp/PlaylistDisplay";
import UserDashboard from "./userComp/UserDashboard";
import PlaylistSongs from "./playlistComp/PlaylistSongs";
import NavBar from "./navbarComp/Navbar";

function App() {
  return (
    <MusicProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:id" element={<PlayerPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/creator/auth" element={<CreatorAuth />} />
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />{" "}
        {/* ← was missing */}
        <Route path="/studio" element={<CreatorDashboard />} />
        <Route path="/creator/upload" element={<UploadModal />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/playlist" element={<PlaylistSongs />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/temp" element={<NavBar />} />
      </Routes>
    </MusicProvider>
  );
}

export default App;
