/* eslint-disable no-unused-vars */
import { Details } from "./HostDetails";

export const getCreatorSongs = async (creatorId) => {
  try {
    const response = await fetch(
      `${Details.domain}user/songs/creator/${creatorId}`,

      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await response.json();
    if (response.ok) return { success: true, songs: data.songs };
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
