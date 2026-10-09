"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LiveRegionContextType {
  announce: (message: string, politeness?: "polite" | "assertive") => void;
}

const LiveRegionContext = React.createContext<LiveRegionContextType | null>(null);

export function useLiveAnnouncer() {
  const context = React.useContext(LiveRegionContext);
  if (!context) {
    return {
      announce: (message: string) => {
        // Fallback for SSR or unmounted contexts
        if (typeof console !== "undefined") {
          console.debug(`[LiveRegion] ${message}`);
        }
      },
    };
  }
  return context;
}

export function LiveRegionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [politeMessage, setPoliteMessage] = React.useState("");
  const [assertiveMessage, setAssertiveMessage] = React.useState("");

  const announce = React.useCallback(
    (message: string, politeness: "polite" | "assertive" = "polite") => {
      if (politeness === "assertive") {
        setAssertiveMessage("");
        setTimeout(() => setAssertiveMessage(message), 50);
      } else {
        setPoliteMessage("");
        setTimeout(() => setPoliteMessage(message), 50);
      }
    },
    []
  );

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
}
