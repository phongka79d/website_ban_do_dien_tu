"use client";

import { useEffect } from "react";

/**
 * SERVICE WORKER MANAGER (Attempt 4.26)
 * Handles global service worker registration outside the RootLayout Server Component.
 */
export default function ServiceWorkerManager() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      // In development, SW can sometimes interfere with HMR/Hot Reloading accurately
      // But for this debug, we might want it always on. 
      // Let's keep it always on for now as requested.
      
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered:", registration.scope);
          })
          .catch((error) => {
            console.error("SW registration failed:", error);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    } else if ("serviceWorker" in navigator) {
       // Also register in dev if needed for this specific debug
       const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered (DEV):", registration.scope);
          })
          .catch((error) => {
            console.error("SW registration failed (DEV):", error);
          });
      };
      registerSW();
    }
  }, []);

  return null; // This component doesn't render anything
}
