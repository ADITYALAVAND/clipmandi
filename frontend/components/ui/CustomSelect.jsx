"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CustomSelect.module.css";

export default function CustomSelect({
  options = [],
  value,
  onChange,
  label = "Platform"
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function selectOption(option) {
    onChange(option);
    setOpen(false);
  }

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <label className={styles.label}>{label}</label>

      <button
        type="button"
        className={`${styles.trigger} ${
          open ? styles.triggerOpen : ""
        }`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <div className={styles.selected}>
          <span className={styles.icon}>
            {getPlatformIcon(value)}
          </span>

          <span>
            {value ? formatPlatform(value) : "Select platform"}
          </span>
        </div>

        <span
          className={`${styles.arrow} ${
            open ? styles.arrowOpen : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.menu}>
          {options.map((option) => (
            <button
              type="button"
              key={option}
              className={`${styles.option} ${
                value === option ? styles.active : ""
              }`}
              onClick={() => selectOption(option)}
            >
              <span className={styles.icon}>
                {getPlatformIcon(option)}
              </span>

              <span>{formatPlatform(option)}</span>

              {value === option && (
                <span className={styles.check}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatPlatform(platform) {
  switch (platform) {
    case "INSTAGRAM":
      return "Instagram";

    case "YOUTUBE":
      return "YouTube";

    case "TIKTOK":
      return "TikTok";

    default:
      return platform || "";
  }
}

function getPlatformIcon(platform) {
  switch (platform) {
    case "INSTAGRAM":
      return "◎";

    case "YOUTUBE":
      return "▶";

    case "TIKTOK":
      return "♪";

    default:
      return "◈";
  }
}