/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Details } from "../api/HostDetails";
import styles from "./UserDashboard.module.css";
export const UpdatePasswordForm = () => {
  const [passwords, setPasswords] = useState({ old: "", new: "" });
  const [status, setStatus] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${Details.domain}user/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwords.old,
          newPassword: passwords.new,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Password updated! High five.");
        setPasswords({ old: "", new: "" });
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (err) {
      setStatus("❌ Server is ghosting us.");
    }
  };

  return (
    <form className={styles.passwordForm} onSubmit={handleUpdate}>
      <input
        type="password"
        placeholder="Old Password"
        className={styles.input}
        value={passwords.old}
        onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="New Password"
        className={styles.input}
        value={passwords.new}
        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
        required
      />
      <button type="submit" className={styles.saveBtn}>
        Update Secret Code
      </button>
      {status && <p className={styles.statusMsg}>{status}</p>}
    </form>
  );
};
