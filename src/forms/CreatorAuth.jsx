import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { creatorSignUp } from "../api/creatorAuth";
import styles from "./CreatorAuth.module.css";
import { Mic2, User, Mail, Lock, AlertCircle } from "lucide-react";

const CreatorAuth = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await creatorSignUp(
        formData.username,
        formData.email,
        formData.password,
      );

      if (result.success) {
        localStorage.setItem("isLoggedIn", "yes");
        navigate("/");
      } else {
        localStorage.setItem("isLoggedIn", "no");
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Mic2 size={20} strokeWidth={1.8} />
          </div>
          <p className={styles.eyebrow}>Creator Portal</p>
          <h1 className={styles.title}>Register your studio</h1>
          <p className={styles.subtitle}>
            Already have an account?{" "}
            <button
              className={styles.footerLink}
              onClick={() => navigate("/auth")}
            >
              Sign in here
            </button>
          </p>
        </div>

        {/* ── Form ── */}
        <form className={styles.form} onSubmit={handleSignUp} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Studio name</label>
            <div className={styles.inputRow}>
              <User size={16} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="e.g. Midnight Records"
                className={styles.input}
                value={formData.username}
                onChange={set("username")}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputRow}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="username"
                className={styles.input}
                value={formData.email}
                onChange={set("email")}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputRow}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Create a strong password"
                className={styles.input}
                value={formData.password}
                onChange={set("password")}
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle
                size={15}
                color="#f87171"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} />
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already a creator?{" "}
            <button
              className={styles.footerLink}
              onClick={() => navigate("/auth")}
            >
              Sign in to your account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatorAuth;
