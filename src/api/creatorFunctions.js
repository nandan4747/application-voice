/* eslint-disable no-unused-vars */
import { Details } from "./HostDetails";

export const getCreatorSongs = async (creatorId, cursor = null) => {
  try {
    const url = new URL(`${Details.domain}user/songs/creator`);
    url.searchParams.set("id", creatorId);
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await response.json();
    if (response.ok)
      return {
        success: true,
        songs: data.songs,
        nextCursor: data.nextCursor || null,
      };

    return {
      success: false,
      error: data.dbError || "Failed to fetch your hits",
    };
  } catch (err) {
    return { success: false, error: "Server went MIA" };
  }
};

export const uploadSongTrack = async (formData) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${Details.domain}creator/v1/auth/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (response.ok) return { success: true, song: data.song };
    return { success: false, error: data.message || "Upload failed" };
  } catch (err) {
    return { success: false, error: "The connection to the studio is lost." };
  }
};

export const deleteSongTrack = async (songId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `${Details.domain}creator/v1/auth/song/${songId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    const responseMessage = await response.json();
    if (response.ok) {
      return { success: true, message: responseMessage.message };
    }

    return { success: false, message: responseMessage.message };
  } catch (err) {
    console.error("enable to delete song");
  }
};
