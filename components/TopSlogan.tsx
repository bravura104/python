"use client";

import React from "react";

export default function TopSlogan() {
  return (
    <div className="sticky-top dingtee-hero border-bottom" style={{ top: 56, zIndex: 9 }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="d-flex align-items-center justify-content-between gap-3 py-2" style={{ flexWrap: "wrap", minHeight: 140 }}>
          <div className="d-flex align-items-center gap-2">
            <span className="d-none d-sm-inline" style={{ color: "#c4b5fd" }}>·</span>
            <span className="d-none d-sm-inline" style={{ color: "#6b7280", fontSize: ".8rem" }}>Premium blank tees, print ready</span>
          </div>

          <div className="d-flex align-items-center gap-1 overflow-auto" style={{ scrollbarWidth: "none" }}>
            {/* Placeholder for the filter pills – keep layout consistent */}
          </div>
        </div>
      </div>
    </div>
  );
}
