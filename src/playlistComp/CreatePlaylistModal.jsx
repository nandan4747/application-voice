import React, { useState, useEffect, useRef } from "react";
import { createNewPlaylist } from "../api/playlistApi";
import styles from "./CreatePlaylist.module.css";

const CreatePlaylistModal = ({ show = false, onSuccess, onClose }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Auto-focus input when modal opens; reset state when it closes
  useEffect(() => {
    if (show) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setName("");
      setError("");
      setLoading(false);
    }
  }, [show]);

  // Close on Escape key
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, onClose]);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Playlist name cannot be empty.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await createNewPlaylist(name.trim());
      if (res.success) {
        setName("");
        onSuccess();
        onClose();
      } else {
        setError(res.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleCreate();
  };

  if (!show) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <p className={styles.eyebrow}>Library</p>
          <h3 className={styles.modalTitle}>New Playlist</h3>
        </div>

        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            placeholder="e.g. Midnight Melancholy"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            className={styles.input}
            maxLength={60}
            disabled={loading}
          />
        </div>

        <p className={styles.inputHint}>
          {name.length > 0
            ? `${60 - name.length} characters remaining`
            : "Give it a name you'll remember"}
        </p>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.createBtn}
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Creating…
              </>
            ) : (
              "Create Playlist"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
