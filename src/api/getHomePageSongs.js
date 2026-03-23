import { Details } from "./HostDetails";

export const getMostPlayedSongs = async () => {
  const url = `${Details.domain}user/mostplayed`;
  const res = await fetch(url, { method: "GET" });
  if (res.ok) {
    return await res.json();
  }
  console.error("failed to get response");
  return false;
};

export const getMostLikedSongs = async () => {
  const url = `${Details.domain}user/mostliked`;
  const res = await fetch(url, { method: "GET" });
  if (res.ok) {
    return await res.json();
  }
  console.error("failed to get response");
  return false;
};
