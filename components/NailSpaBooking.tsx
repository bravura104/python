"use client";

const EMBED_TOKEN = process.env.NEXT_PUBLIC_DOVARA_NAIL_TOKEN ?? "";
const BOOKING_URL = `https://dovara.biz/book?token=${EMBED_TOKEN}&embed=1&lang=en`;

export default function NailSpaBooking() {
  return (
    <section className="border-t border-gray-100 py-14 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Label */}
        <p className="text-xs font-bold tracking-widest uppercase text-pink-500 mb-2 text-center">
          Other Services
        </p>

        {/* Heading */}
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
          Graduation &amp; Congratulations?
        </h2>
        <p className="text-center text-gray-500 mb-8 text-base">
          Complete your celebration look with a&nbsp;
          <span className="font-semibold text-purple-600">Nail &amp; Spa</span>
          &nbsp;appointment — book online in seconds.
        </p>

        {/* Booking iframe */}
        {EMBED_TOKEN ? (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-purple-100">
            <iframe
              src={BOOKING_URL}
              width="100%"
              height="660"
              style={{ border: "none", display: "block" }}
              allow="forms"
              loading="lazy"
              title="Nail & Spa Appointment Booking"
            />
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-white p-10 text-center text-gray-400">
            <p className="font-semibold mb-1">Booking form not configured</p>
            <p className="text-sm">
              Set{" "}
              <code className="bg-gray-100 px-1 rounded">
                NEXT_PUBLIC_DOVARA_NAIL_TOKEN
              </code>{" "}
              in <code className="bg-gray-100 px-1 rounded">.env.local</code>{" "}
              with the embed token from{" "}
              <a
                href="https://dovara.biz"
                className="text-purple-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                dovara.biz
              </a>{" "}
              → Settings → Embed &amp; API.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
