import "./App.css";
import PlayerPage from "./musicComponents/PlayerPage";
import { Routes, Route } from "react-router-dom";
import Home from "./homeComp/Home";
import AuthPage from "./forms/AuthPage";
import CreatorAuth from "./forms/CreatorAuth";
import CreatorDashboard from "./creatorComp/CreatorDashboard";
import UploadModal from "./creatorComp/UploadModal";
import SearchPage from "./homeComp/SearchPage";
import UserDashboard from "./userComp/UserDashboard";
import PlaylistSongs from "./playlistComp/PlaylistSongs";
import { BatchLists } from "./musicComponents/BatchLists";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMusic } from "./MusicContext";

import SongLinkHandler from "./musicComponents/SongLinkHandler";
import {AlertDailog} from "./NotificationComp/AlertDailog.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});
function App() {
  const { isPlayerMinimized } = useMusic();
  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={
          isPlayerMinimized
            ? "global-overlay-layer-mini-screen"
            : "global-overlay-layer-full-screen"
        }
      >
        <PlayerPage />
      </div>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/play/:id" element={<SongLinkHandler />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/creator/auth" element={<CreatorAuth />} />
        <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        <Route path="/studio" element={<CreatorDashboard />} />
        <Route path="/creator/upload" element={<UploadModal />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/playlist" element={<PlaylistSongs />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/batchplay" element={<BatchLists />} />
        <Route path="/temp" element={<AlertDailog />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
