"use client";
import { useEffect } from "react";

export default function AnimeGetter() {
  useEffect(() => {
    const threshold = 100; // milliseconds; adjust as needed

    const detectDevTools = () => {
      const start = performance.now();
      // The debugger statement will pause execution if devtools are open.
      debugger;
      const end = performance.now();

      // If the pause is longer than our threshold, assume devtools are open.
      if (end - start > threshold) {
        window.location.reload();
      }
    };

    // Check every second.
    const intervalId = setInterval(detectDevTools, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
