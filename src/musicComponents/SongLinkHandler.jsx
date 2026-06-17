import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMusic } from "../MusicContext";

const SongLinkHandler = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = useMusic();

  useEffect(() => {
    if (id) {
      playTrack(id); 
      navigate("/", { replace: true }); 
    }
  }, [id, playTrack, navigate]);

  return null; 
};

export default SongLinkHandler;