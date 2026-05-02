"use client";

import { useEffect } from "react";

/**
 * Loads Bootstrap JS on the client side only.
 * Must be rendered inside a Client Component boundary.
 */
export default function BootstrapInit() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return null;
}
