"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { useSearchParams, useRouter } from "next/navigation";

/** Contains all hooks including useSearchParams – must live inside <Suspense> */
function HeaderInner() {
  const { totalItems } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  }

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white border-bottom sticky-top shadow-sm">
      <div className="container-xl">
        {/* Brand */}
        <Link href="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <span style={{ fontSize: "1.5rem" }}>👕</span>
          <span>DingTee909</span>
        </Link>

        {/* Search bar – visible on md+ inline, collapses into nav on mobile */}
        <form
          onSubmit={handleSearch}
          className="d-none d-md-flex align-items-center gap-1 flex-grow-1 mx-3"
          style={{ maxWidth: "380px" }}
        >
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" className="btn btn-sm btn-dark">
            Search
          </button>
        </form>

        {/* Desktop-only links */}
        <div className="d-none d-md-flex ms-3 align-items-center gap-2">
          <ul className="navbar-nav ms-auto align-items-md-center gap-md-2 d-flex">
            <li className="nav-item">
              <Link href="/" className="nav-link fw-medium text-dark">Shop</Link>
            </li>
            <li className="nav-item">
              <Link href="/return-policy" className="nav-link fw-medium text-dark">Returns</Link>
            </li>
          </ul>
        </div>

        {/* Cart icon + Hamburger toggler – always visible and aligned to the far right */}
        <div className="d-flex align-items-center gap-2 ms-auto">
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

          {/* Mobile offcanvas toggler (prevents collapse flicker on mobile) */}
          <button
            className="navbar-toggler d-md-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileNavOffcanvas"
            aria-controls="mobileNavOffcanvas"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
        </div>

        {/* Mobile nav is handled by the offcanvas below; remove collapsed duplicate */}

        {/* Desktop-only links */}
        <div className="d-none d-md-flex ms-auto align-items-center gap-2">
          <ul className="navbar-nav ms-auto align-items-md-center gap-md-2 d-flex">
            <li className="nav-item">
              <Link href="/" className="nav-link fw-medium text-dark">Shop</Link>
            </li>
            <li className="nav-item">
              <Link href="/return-policy" className="nav-link fw-medium text-dark">Returns</Link>
            </li>
          </ul>
        </div>

        {/* Offcanvas mobile nav (shown only on small screens) */}
        <div
          className="offcanvas offcanvas-top d-md-none"
          tabIndex={-1}
          id="mobileNavOffcanvas"
          aria-labelledby="mobileNavOffcanvasLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="mobileNavOffcanvasLabel">Menu</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <form
              onSubmit={handleSearch}
              className="d-flex align-items-center gap-1 mb-2"
            >
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Search products…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
              />
              <button type="submit" className="btn btn-sm btn-dark">Search</button>
            </form>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link href="/" className="nav-link fw-medium text-dark">Shop</Link>
              </li>
              <li className="nav-item">
                <Link href="/return-policy" className="nav-link fw-medium text-dark">Returns</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

/** Thin shell that provides the required Suspense boundary for useSearchParams */
export default function Header() {
  return (
    <Suspense
      fallback={
        <nav
          className="navbar navbar-light bg-white border-bottom sticky-top shadow-sm"
          style={{ minHeight: 56 }}
        />
      }
    >
      <HeaderInner />
    </Suspense>
  );
}
