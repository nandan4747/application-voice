/* eslint-disable no-unused-vars */
import { Details } from "./HostDetails";
export const getSongDetails = async (songId) => {
  try {
    const url = `${Details.domain}user/play/${songId} `;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      return false;
    }
    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

export const checkSongLikedFlag = async (songId) => {
  try {
    const token = localStorage.getItem("token") || "token";
    const url = `${Details.domain}user/likeflag/${songId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      return await res.json();
    }
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const toggleLikeStatus = async (songId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return { success: false, error: "Please login to like songs" };
  }

  try {
    const response = await fetch(`${Details.domain}user/like/${songId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, isLiked: data.isLiked, message: data.message };
    }

    return { success: false, error: data.error || "Failed to toggle like" };
  } catch (err) {
    console.error("Like toggle error:", err);
    return { success: false, error: "Network error" };
  }
};
export const searchSongs = async (query) => {
  try {
    const response = await fetch(`${Details.domain}user/search?title=${query}`);
    const data = await response.json();
    if (response.ok) return { success: true, results: data.results };
    return { success: false, error: data.message };
  } catch (err) {
    return { success: false, error: "Search failed" };
  }
};
// songFunctions.js
export const fetchMoreByTags = async (tags, cursor) => {
  try {
    const tagsParam = encodeURIComponent(tags.join(" "));
    const cursorParam = encodeURIComponent(cursor);
    const response = await fetch(
      `${Details.domain}user/related?tags=${tagsParam}&nextCursor=${cursorParam}`,
    );
    const data = await response.json();
    if (response.ok)
      return {
        success: true,
        results: data.results,
        nextCursor: data.nextCursor,
      };
    return { success: false };
  } catch {
    return { success: false };
  }
};
