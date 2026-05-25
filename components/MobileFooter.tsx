"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MobileFooter() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    function onScroll() {
      const y = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (y > lastY + 10) {
            setHidden(true); // scrolling down
          } else if (y < lastY - 10) {
            setHidden(false); // scrolling up
          }
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`navbar navbar-light bg-white border-top fixed-bottom d-md-none shadow-sm transition-transform`} 
      style={{ transform: hidden ? 'translateY(100%)' : 'translateY(0)', transition: 'transform 200ms ease-in-out' }}
      aria-label="Mobile bottom navigation"
    >
      <div className="container-fluid d-flex justify-content-around p-1">
        <Link href="/" className="text-center text-decoration-none text-dark">
          <div className="d-flex flex-column align-items-center" style={{fontSize: '0.9rem'}}>
            <i className="bi bi-house-door" style={{fontSize: '1.1rem'}} />
            <small>Home</small>
          </div>
        </Link>
        <Link href="/" className="text-center text-decoration-none text-dark">
          <div className="d-flex flex-column align-items-center" style={{fontSize: '0.9rem'}}>
            <i className="bi bi-grid" style={{fontSize: '1.1rem'}} />
            <small>Category</small>
          </div>
        </Link>
        <Link href="/login" className="text-center text-decoration-none text-dark">
          <div className="d-flex flex-column align-items-center" style={{fontSize: '0.9rem'}}>
            <i className="bi bi-person" style={{fontSize: '1.1rem'}} />
            <small>Me</small>
          </div>
        </Link>
      </div>
    </nav>
  );
}
