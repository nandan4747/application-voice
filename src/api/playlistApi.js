import { Details } from "./HostDetails";
import { isNotAuth } from "./authenticationHandler";
export const getUserPlaylists = async (callback) => {
  const token = localStorage.getItem("token") || "token";

  try {
    const response = await fetch(`${Details.domain}user/playlists`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    
    isNotAuth(response, callback);
    if (response.ok) return { success: true, playlists: data.playlists };
    return { success: false, error: data.error || "Failed to fetch playlists" };
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return { success: false, error: "The server is taking a nap." };
  }
};

export const createNewPlaylist = async (playlistName) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${Details.domain}user/newplaylist`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playListName: playlistName }),
    });

    const data = await response.json();
    if (response.ok) return { success: true, message: data.message };
    return { success: false, error: data.error };
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return { success: false, error: "Network failed. Is the server even on?" };
  }
};
export const addSongToPlaylist = async (playlistId, songId) => {
  const token = localStorage.getItem("token") || "token";
  try {
    const response = await fetch(`${Details.domain}user/playlist/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playListId: parseInt(playlistId),
        songId: parseInt(songId),
      }),
    });

    const data = await response.json();
    if (response.ok) return { success: true, message: data.message };
    return { success: false, error: data.error };
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return { success: false, error: "Connection lost in the Grand Line." };
  }
};
