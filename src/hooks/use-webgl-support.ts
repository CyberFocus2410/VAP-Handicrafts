"use client";

import { useEffect, useState } from "react";

interface WebGLSupportState {
  isSupported: boolean;
  checked: boolean;
  reason: string | null;
}

/**
 * Hook to test WebGL context capability, data-saver mode, and hardware readiness.
 * Safely falls back to static editorial imagery when WebGL is unavailable or unsuited.
 */
export function useWebGLSupport(): WebGLSupportState {
  const [support, setSupport] = useState<WebGLSupportState>({
    isSupported: false,
    checked: false,
    reason: null,
  });

  useEffect(() => {
    // 1. Data Saver mode check (respect network budget)
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    if (nav.connection?.saveData) {
      setSupport({
        isSupported: false,
        checked: true,
        reason: "data-saver-enabled",
      });
      return;
    }

    // 2. Low hardware capability check
    if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 2) {
      setSupport({
        isSupported: false,
        checked: true,
        reason: "low-hardware-concurrency",
      });
      return;
    }

    // 3. WebGL / WebGL2 canvas context test
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");

      if (!gl) {
        setSupport({
          isSupported: false,
          checked: true,
          reason: "no-webgl-context",
        });
        return;
      }

      setSupport({
        isSupported: true,
        checked: true,
        reason: null,
      });
    } catch {
      setSupport({
        isSupported: false,
        checked: true,
        reason: "webgl-init-failed",
      });
    }
  }, []);

  return support;
}
