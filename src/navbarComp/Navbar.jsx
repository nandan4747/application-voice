import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Styles from "./navstyles.module.css";
import logo from "/logo_voice_.png";

const NavBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const trimmedValue = searchTerm.trim();
      if (trimmedValue.length > 0) {
        navigate(`/search?q=${trimmedValue}`);
      } else {
        navigate("/");
      }
      // collapse on mobile after search
      setMobileSearchActive(false);
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setMobileSearchActive(false);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setMobileSearchActive(true);
  };

  const handleBlur = () => {
    // small delay so clicks on the X button register first
    setTimeout(() => setMobileSearchActive(false), 150);
  };

  const handleCancelClick = () => {
    setSearchTerm("");
    setMobileSearchActive(false);
    inputRef.current?.blur();
  };

  return (
    <div className={`${Styles.main} ${mobileSearchActive ? Styles.searchExpanded : ""}`}>
      {/* Logo — hidden on mobile when search is active */}
      <div
        className={`${Styles.logo_section} ${mobileSearchActive ? Styles.hidden : ""}`}
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", marginLeft: "3%" }}>
          <div className={Styles.logo_container}>
            <img src={logo} alt="logo" />
          </div>
          <p className={Styles.logo_text}>VOICE</p>
        </div>
      </div>

      {/* Search bar */}
      <div className={`${Styles.searchbar} ${mobileSearchActive ? Styles.searchbarExpanded : ""}`}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for tracks"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {/* Cancel button — only visible on mobile when search is active */}
        {mobileSearchActive && (
          <button className={Styles.cancelBtn} onMouseDown={handleCancelClick}>
            ✕
          </button>
        )}
      </div>

      {/* User icon — hidden on mobile when search is active */}
      <div
        className={`${Styles.user} ${mobileSearchActive ? Styles.hidden : ""}`}
        onClick={() => {
          const isLoggedIn = localStorage.getItem("isLoggedIn");
          navigate(isLoggedIn === "yes" ? "/dashboard" : "/auth");
        }}
        style={{ cursor: "pointer" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 15H6a4 4 0 0 0-4 4v2" />
          <circle cx="18" cy="15" r="3" />
          <circle cx="9" cy="7" r="4" />
          <path d="M18 12V11M18 19V18" />
        </svg>
      </div>
    </div>
  );
};

export default NavBar;