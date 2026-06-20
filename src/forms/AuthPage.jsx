import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signUpUser } from "../api/authFunctions";
import styles from "./AuthPage.module.css";
import { Music, Mail, Lock, User, AlertCircle } from "lucide-react";
import { useMusic } from "../MusicContext";

const AuthPage = () => {
  const { closePlayer } = useMusic();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    closePlayer();
  }, []);
  const navigate = useNavigate();

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = isLogin
        ? await loginUser(formData.email, formData.password)
        : await signUpUser(
            formData.username,
            formData.email,
            formData.password,
          );

      if (result.success) {
        localStorage.setItem("isLoggedIn", "yes");
        navigate("/");
      } else {
        setError(result.error || "Something went wrong.");
        localStorage.setItem("isLoggedIn", "no");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        {/* ── Header ── */}
        <div className={styles.logoSection}>
          <div className={styles.iconWrap}>
            <Music size={20} strokeWidth={1.8} />
          </div>
          <p className={styles.eyebrow}>
            {isLogin ? "Welcome back" : "Get started"}
          </p>
          <h1 className={styles.pageTitle}>
            {isLogin ? "Sign in to Voice" : "Create your account"}
          </h1>
          <p className={styles.pageSubtitle}>
            {isLogin
              ? "Your music is waiting."
              : "Join thousands of listeners on Voice."}
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {!isLogin && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nick Name</label>
              <div className={styles.inputGroup}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="e.g. soundwave99"
                  required
                  value={formData.username}
                  onChange={set("username")}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>username</label>
            <div className={styles.inputGroup}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                placeholder="example : cooluser1234"
                required
                value={formData.email}
                onChange={set("email")}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputGroup}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type="password"
                placeholder={
                  isLogin ? "Your password" : "Create a strong password"
                }
                required
                value={formData.password}
                onChange={set("password")}
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
              <p className={styles.error}>{error}</p>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? isLogin
                ? "Signing in…"
                : "Creating account…"
              : isLogin
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* ── Footer — NO <p> inside <p> ── */}
        <div className={styles.footer}>
          <div className={styles.toggleText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              className={styles.linkBtn}
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div className={styles.toggleText}>
            Are you a creator?
            <span className={styles.divider} />
            <button
              className={styles.linkBtn}
              onClick={() => navigate("/creator/auth")}
            >
              Register your studio
            </button>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke=" #df15fa"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-music2-icon lucide-music-2"
        >
          <circle cx="8" cy="18" r="4" />
          <path d="M12 18V2l7 4" />
        </svg>
        <p
          onClick={() => {
            navigate("/", { replace: true });
          }}
          style={{
            color: "white",
            fontWeight: "800",
            cursor: "pointer",
          }}
        >
          Back to Vibe
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
