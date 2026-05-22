"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const utm = {
      utm_source:   searchParams.get("utm_source")   ?? "",
      utm_medium:   searchParams.get("utm_medium")   ?? "",
      utm_campaign: searchParams.get("utm_campaign") ?? "",
      utm_content:  searchParams.get("utm_content")  ?? "",
      utm_term:     searchParams.get("utm_term")     ?? "",
    };

    if (utm.utm_source) {
      try {
        localStorage.setItem("utm_data", JSON.stringify(utm));
      } catch {
        // localStorage may be unavailable (e.g. private browsing with strict settings)
      }
    }

    router.replace("/");
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400 text-sm">Redirecting…</p>
    </div>
  );
}

export default function AdPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-400 text-sm">Loading…</p>
        </div>
      }
    >
      <AdRedirect />
    </Suspense>
  );
}
