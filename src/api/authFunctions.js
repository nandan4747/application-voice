import { Details } from "./HostDetails";
import { isNotAuth } from "./authenticationHandler";

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${Details.domain}user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, data };
    }
    return { success: false, error: data.error || "Login failed" };
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return { success: false, error: "Server unreachable" };
  }
};

export const signUpUser = async (username, email, password) => {
  try {
    const response = await fetch(`${Details.domain}user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, data };
    }
    return { success: false, error: data.error || "Signup failed" };
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return { success: false, error: "Server unreachable" };
  }
};

export const handleDeleteAccount = async (onSuccess, callback) => {
  const token = localStorage.getItem("token") || "token";

  try {
    const res = await fetch(`${Details.domain}user/delete-account`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    isNotAuth(res, callback);
    if (res.ok) {
      alert("Account deleted successfully. Redirecting...");
      // 1. Clear everything!
      localStorage.clear();
      // 2. Send them to the shadow realm (login page)
      onSuccess();
    } else {
      const data = await res.json();
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    console.error("Account Deletion failed:", err);
    alert("Server error. Maybe it's a sign you should stay?");
  }
};
