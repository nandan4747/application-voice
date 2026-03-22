/* eslint-disable no-unused-vars */
import { Details } from "./HostDetails";

export const creatorSignUp = async (username, email, password) => {
  try {
    const response = await fetch(`${Details.domain}creator/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", "creator"); // Crucial for dashboard logic
      return { success: true, data };
    }
    return { success: false, error: data.message || "Signup failed" };
  } catch (err) {
    return { success: false, error: "Creator server is offline" };
  }
};

export const creatorLogin = async (email, password) => {
  try {
    const response = await fetch(`${Details.domain}creator/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", "creator");
      return { success: true, data };
    }
    return { success: false, error: data.message || "Login failed" };
  } catch (err) {
    return { success: false, error: "Connection error" };
  }
};
