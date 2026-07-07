import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Styles from "./navstyles.module.css";
import logo from "/logo_voice_.png";

const NavBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const searchTimerRef = useRef(null);
  const [loginFlag, setLoginFlag] = useState("no");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "yes";
    setLoginFlag(isLoggedIn);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    const trimmedValue = newValue.trim();

    // Reset the debounce timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (trimmedValue.length > 0) {
      searchTimerRef.current = setTimeout(() => {
        navigate(`/search?q=${trimmedValue}`);
        //console.log("searching after 3s of silence");
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    setSearchTerm(e.target.value);
    const trimmedValue = searchTerm.trim();
    // console.log(`searched term : ${trimmedValue}`);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (e.key === "Enter") {
      if (trimmedValue.length > 0) {
        navigate(`/search?q=${trimmedValue}`);
      } else {
        navigate("/");
      }
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
    <div
      className={`${Styles.main} ${mobileSearchActive ? Styles.searchExpanded : ""} ${scrolled ? Styles.scrolled : ""}`}
    >
      {
        /* glass effect stuff */
        <svg
          style={{ width: 0, height: 0, position: "absolute" }}
          aria-hidden="true"
        >
          <filter id="liquid-glass">
            <feTurbulence
              type="fractalNoise"
               baseFrequency="0.0009"
              numOctaves="10"
              result="warp"
            />
            <feDisplacementMap
              in="SourceGraphic"
          
              scale="69"
              xChannelSelector="R"
              yChannelSelector="G"
              result="distorted"
            />
            <feColorMatrix
              in="distorted"
              type="matrix"
              values="1 0 0 0 0
              0 0 0 0 0
              0 0 0 0 0
              0 0 0 1 0"
              result="red"
            />
            <feColorMatrix
              in="distorted"
              type="matrix"
              values="0 0 0 0 0
              0 1 0 0 0
              0 0 0 0 0
              0 0 0 1 0"
              result="green"
            />
            <feColorMatrix
              in="distorted"
              type="matrix"
              values="0 0 0 0 0
              0 0 0 0 0
              0 0 1 0 0
              0 0 0 1 0"
              result="blue"
            />
            <feOffset in="red" dx="-0.9" dy="2.4" result="red_shifted" />
            <feOffset in="blue" dx="2" dy="-2.4" result="blue_shifted" />
            <feBlend
              mode="screen"
              in="red_shifted"
              in2="green"
              result="rg_combo"
            />
            <feBlend
              mode="screen"
              in="rg_combo"
              in2="blue_shifted"
              result="final_prism"
            />
          </filter>
        </svg>
      }
      {/*blur effect div */}

      
      {/* Logo — hidden on mobile when search is active */}

      <div
        className={`${Styles.logo_section} ${mobileSearchActive ? Styles.hidden : ""}`}
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginLeft: "5%" }}
        >
          <div className={Styles.logo_container}>
            <img src={logo} alt="logo" />
          </div>
          <p className={`${Styles.logo_text} josefin-sans-custom`}>VOICE</p>
        </div>
      </div>

      {/* Search bar */}
      <div
        className={`${Styles.searchbar} ${mobileSearchActive ? Styles.searchbarExpanded : ""}`}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for tracks"
          onChange={handleInputChange}
          value={searchTerm}
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
        {loginFlag ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-scan-face-icon lucide-scan-face"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <path d="M9 9h.01" />
            <path d="M15 9h.01" />
          </svg>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default NavBar;
