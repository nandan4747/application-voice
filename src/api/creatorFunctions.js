/* eslint-disable no-unused-vars */
import { Details } from "./HostDetails";
import { isNotAuth } from "./authenticationHandler";
import { supabase } from "./supabaseClient";

export const getCreatorSongs = async (creatorId, cursor = null, callback) => {
  try {
    const url = new URL(`${Details.domain}user/songs/creator`);
    url.searchParams.set("id", creatorId);
    if (cursor) url.searchParams.set("cursor", cursor);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || "token"}`,
      },
    });

    const data = await response.json();
    isNotAuth(response, callback);
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

export const uploadSongTrack = async ({ file, songName, genre, tags }) => {
  const token = localStorage.getItem("token");
  try {
    const signRes = await fetch(
      `${Details.domain}creator/v1/auth/upload/sign`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          songName,
          genre,
          tags,
        }),
      },
    );

    const signData = await signRes.json();
    if (!signRes.ok) {
      return {
        success: false,
        error: signData.message || "Could not start upload",
      };
    }
    const { error } = await supabase.storage
      .from("songs")
      .uploadToSignedUrl(signData.path, signData.token, file, {
        contentType: file.type,
      });

    if (error) return { success: false, error: error.message };

    return { success: true, path: signData.path };
  } catch (err) {
    return { success: false, error: "The connection to the studio is lost." };
  }
};

export const waitForSong = async (
  path,
  { tries = 15, interval = 2000 } = {},
) => {
  const token = localStorage.getItem("token");

  for (let i = 0; i < tries; i++) {
    await new Promise((r) => setTimeout(r, interval));
    try {
      const res = await fetch(
        `${Details.domain}creator/v1/auth/upload/status?path=${encodeURIComponent(path)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.status === "ready") return { success: true, song: data.song };
      if (data.status === "missing") break; // nothing to wait for
    } catch {
      // network hiccup, try again
    }
  }
  return { success: false };
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
