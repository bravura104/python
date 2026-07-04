import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Available in Your Region — Mart36",
};

export default function RegionBlockedPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-6">🌎</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Not Available in Your Region
      </h1>
      <p className="text-gray-500 mb-8">
        Sorry — Mart36 currently ships within the&nbsp;
        <strong>United States</strong> and <strong>Canada</strong> only.
        Checkout is not available from your location.
      </p>
      <Link
        href="/"
        className="inline-block bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
      >
        Back to Store
      </Link>
    </div>
  );
}
