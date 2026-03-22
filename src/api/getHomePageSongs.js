import { Details } from "./HostDetails";

export const getMostPlayedSongs = async () => {
  console.log("checking");
  const url = `${Details.domain}user/mostplayed`;
  const res = await fetch(url, { method: "GET" });
  if (res.ok) {
    return await res.json();
  }
  console.error("failed to get response");
  return false;
};

export const getMostLikedSongs = async () => {
  console.log("checking");
  const url = `${Details.domain}user/mostliked`;
  const res = await fetch(url, { method: "GET" });
  if (res.ok) {
    console.log("got response ");
    return await res.json();
  }
  console.error("failed to get response");
  return false;
};
