"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white border-bottom sticky-top shadow-sm">
      <div className="container-xl">
        {/* Brand */}
        <Link href="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <span style={{ fontSize: "1.5rem" }}>👕</span>
          <span>TeeStore</span>
        </Link>

        {/* Cart icon + Hamburger toggler – always visible on the right */}
        <div className="d-flex align-items-center gap-2">
          <Link
            href="/cart"
            className="nav-link fw-medium d-flex align-items-center gap-1 position-relative"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="d-none d-md-inline">Cart</span>
            {totalItems > 0 && (
              <span className="badge rounded-pill bg-dark ms-1">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
        </div>

        {/* Collapsible nav links */}
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-md-center gap-md-2">
            <li className="nav-item">
              <Link href="/" className="nav-link fw-medium">
                Shop
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
