"use client";

/**
 * VariantImage
 * Wraps ProductImage and reacts to color-selection events dispatched by
 * AddToCartSection, swapping the displayed image and background colour
 * without any prop drilling.
 *
 * AddToCartSection dispatches:
 *   document.dispatchEvent(new CustomEvent("productColorChange", {
 *     detail: { colorName: string, colorHex: string }
 *   }))
 */

import { useState, useEffect } from "react";
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

  useEffect(() => {
    function handleColorChange(e: Event) {
      const { colorName, colorHex } = (e as CustomEvent<{ colorName: string; colorHex: string }>).detail;
      setSrc(images?.[colorName] ?? defaultSrc);
      setBgColor(colorHex ?? defaultBgColor);
    }

    document.addEventListener("productColorChange", handleColorChange);
    return () => document.removeEventListener("productColorChange", handleColorChange);
  }, [images, defaultSrc, defaultBgColor]);

  // key forces ProductImage to re-mount (resetting its internal failed state) when src changes
  return (
    <ProductImage
      key={src ?? "__fallback__"}
      src={src}
      alt={alt}
      bgColor={bgColor}
      className={className}
      emojiSize={emojiSize}
    />
  );
}
