import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signUpUser } from "../api/authFunctions";
import styles from "./AuthPage.module.css";
import { Music, Mail, Lock, User, AlertCircle } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
              <label className={styles.label}>Username</label>
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
            <label className={styles.label}>Email</label>
            <div className={styles.inputGroup}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                placeholder="you@example.com"
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
    </div>
  );
};

export default AuthPage;
