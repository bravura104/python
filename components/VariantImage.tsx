"use client";

/**
 * VariantImage
 * Wraps ProductImage and reacts to color-selection events dispatched by
 * AddToCartSection, swapping the displayed image and background colour
 * without any prop drilling.
 *
 * On hover, a circular magnifier lens overlays the image showing 2× zoom
 * centred on the mouse position.
 *
 * AddToCartSection dispatches:
 *   document.dispatchEvent(new CustomEvent("productColorChange", {
 *     detail: { colorName: string, colorHex: string }
 *   }))
 */

import { useState, useEffect, useRef } from "react";
import ProductImage from "./ProductImage";

interface Props {
  defaultSrc?: string;
  defaultBgColor: string;
  /** Map of color name → image URL, from product.images */
  images?: Record<string, string>;
  alt: string;
  className?: string;
  emojiSize?: string;
}

const LENS_SIZE = 220; // diameter of the magnifier circle in px

export default function VariantImage({
  defaultSrc,
  defaultBgColor,
  images,
  alt,
  className,
  emojiSize,
}: Props) {
  const [src, setSrc]         = useState(defaultSrc);
  const [bgColor, setBgColor] = useState(defaultBgColor);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleColorChange(e: Event) {
      const { colorName, colorHex } = (e as CustomEvent<{ colorName: string; colorHex: string }>).detail;
      setSrc(images?.[colorName] ?? defaultSrc);
      setBgColor(colorHex ?? defaultBgColor);
    }

    document.addEventListener("productColorChange", handleColorChange);
    return () => document.removeEventListener("productColorChange", handleColorChange);
  }, [images, defaultSrc, defaultBgColor]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  const showLens = mousePos !== null && !!src && !!wrapRef.current;

  let lensLeft = 0, lensTop = 0;
  let imgZoomStyle: React.CSSProperties = {};

  if (showLens && wrapRef.current) {
    const W = wrapRef.current.offsetWidth;
    const H = wrapRef.current.offsetHeight;
    const xFrac = mousePos!.x / W;
    const yFrac = mousePos!.y / H;

    // Clamp lens position so the full circle stays within the container
    lensLeft = Math.max(0, Math.min(W - LENS_SIZE, mousePos!.x - LENS_SIZE / 2));
    lensTop  = Math.max(0, Math.min(H - LENS_SIZE, mousePos!.y - LENS_SIZE / 2));

    // Scale the zoomed image to 2× the container, offset so the cursor
    // point (xFrac, yFrac) maps to the centre of the lens
    imgZoomStyle = {
      position: "absolute",
      width: W * 2,
      height: H * 2,
      left: LENS_SIZE / 2 - xFrac * 2 * W,
      top:  LENS_SIZE / 2 - yFrac * 2 * H,
      objectFit: "contain",
      userSelect: "none",
    };
  }

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden cursor-crosshair ${className ?? ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* key forces ProductImage to re-mount (resetting its failed state) when src changes */}
      <ProductImage
        key={src ?? "__fallback__"}
        src={src}
        alt={alt}
        bgColor={bgColor}
        className="w-full h-full rounded-3xl shadow-inner"
        emojiSize={emojiSize}
      />

      {showLens && (
        <div
          style={{
            position: "absolute",
            left: lensLeft,
            top: lensTop,
            width: LENS_SIZE,
            height: LENS_SIZE,
            overflow: "hidden",
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.9)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {/* background fill so transparent-PNG edges don't show black */}
          <div style={{ position: "absolute", inset: 0, backgroundColor: bgColor }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src!} alt="" aria-hidden draggable={false} style={imgZoomStyle} />
        </div>
      )}
    </div>
  );
}
