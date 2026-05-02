"use client";

import { useEffect } from "react";

/**
 * Loads Bootstrap JS on the client side only.
 * Must be rendered inside a Client Component boundary.
 */
export default function BootstrapInit() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return null;
}
