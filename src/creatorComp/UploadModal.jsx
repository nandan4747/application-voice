import React, { useState, useRef } from "react";
import { Upload, X, Music, CheckCircle2, Loader2 } from "lucide-react";
import { uploadSongTrack } from "../api/creatorFunctions";
import styles from "./UploadModal.module.css";

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [songName, setSongName] = useState("");
  const [genre, setGenre] = useState("pop");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("audio/")) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid audio file (mp3, m4a, etc.)");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError("No song, no vibe. Select a file.");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("songName", songName);
    formData.append("genre", genre);
    formData.append("songFile", file);

    const result = await uploadSongTrack(formData);

    if (result.success) {
      onUploadSuccess(result.song);
      onClose(); // Close modal on success
    } else {
      setError(result.error);
    }
    setIsUploading(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X />
        </button>

        <div className={styles.header}>
          <Upload size={32} color="#facc15" />
          <h2>Upload New Track</h2>
        </div>

        <form onSubmit={handleUpload}>
          <div className={styles.inputGroup}>
            <label>Track Title</label>
            <input
              type="text"
              placeholder="e.g. Like Jennie"
              required
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Genre</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="melody">Melody</option>
              <option value="rap">Rap</option>
              <option value="romance">Romance</option>
              <option value="classic">Classic</option>
              <option value="sad">sad/soul</option>
              <option value="anime">Anime</option>
              <option value="phonk">Phonk</option>
              <option value="epic">Epic</option>
            </select>
          </div>

          <div
            className={`${styles.dropZone} ${file ? styles.hasFile : ""}`}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="audio/*"
              onChange={handleFileChange}
            />
            {file ? (
              <div className={styles.fileDetail}>
                <CheckCircle2 color="#1db954" />
                <span>{file.name}</span>
              </div>
            ) : (
              <>
                <Music size={24} />
                <p>Click to browse audio files</p>
              </>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className={styles.spin} /> Uploading...
              </>
            ) : (
              "Publish Track"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
