import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useMusic } from "../MusicContext";

const SongLinkHandler = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // 1. Grab the hook
  const { playTrack } = useMusic();

  const shallNavigate = searchParams.get("navigate") !== "false";

  useEffect(() => {
    if (id) {
      playTrack(id);

      if (shallNavigate) {
        navigate("/", { replace: true });
      }
    }
  }, [id, playTrack, navigate, shallNavigate]);

  return null;
};

export default SongLinkHandler;