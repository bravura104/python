"use client";

import { useState } from "react";

interface Props {
  /** URL of the product photo. When omitted the emoji fallback is shown. */
  src?: string;
  alt: string;
  /** First colour hex used as the background fill */
  bgColor: string;
  /** Extra classes applied to the outer container (should include height) */
  className?: string;
  /** Tailwind text-size class for the fallback emoji — defaults to "text-8xl" */
  emojiSize?: string;
}

/**
 * Renders a product image with a coloured background.
 * Falls back to a t-shirt emoji when `src` is absent or fails to load.
 */
export default function ProductImage({
  src,
  alt,
  bgColor,
  className = "",
  emojiSize = "text-8xl",
}: Props) {
  const [failed, setFailed] = useState(false);
  const showEmoji = !src || failed;

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {!showEmoji && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
      {showEmoji && (
        <span className={`${emojiSize} drop-shadow-lg select-none`}>👕</span>
      )}
    </div>
  );
}
