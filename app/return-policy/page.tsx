import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return & Refund Policy – HangPho36.vn",
  description: "HangPho36.vn's return and refund policy for marketplace orders.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        Return &amp; Refund Policy
      </h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: May 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Our Guarantee</h2>
          <p>
            We stand behind the quality of every item we print. If your order
            arrives damaged, defective, or with a printing error, we will replace
            it or issue a full refund — no questions asked.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Eligibility</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Defective or damaged items</strong> – report within{" "}
              <strong>14 days</strong> of delivery with a photo. We&rsquo;ll send a
              free replacement or full refund.
            </li>
            <li>
              <strong>Wrong item received</strong> – we&rsquo;ll reship the correct
              item at no cost.
            </li>
            <li>
              <strong>Size exchange</strong> – we accept one size exchange per order
              if the item is unworn and unwashed, within 30 days of delivery.
              Customer covers return shipping; we cover the reshipment.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Non-Returnable Items
          </h2>
          <p>
            Because every item is made to order (custom print on demand), we
            cannot accept returns or exchanges for:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Buyer&rsquo;s remorse or change of mind</li>
            <li>Incorrect size ordered (please use our size guide before ordering)</li>
            <li>Items that have been worn, washed, or altered</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Refund Process</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Email us at{" "}
              <a
                href="mailto:support@hangpho36.vn"
                className="text-black underline"
              >
                support@hangpho36.vn
              </a>{" "}
              with your order number and a photo of the issue.
            </li>
            <li>
              Our team will respond within <strong>1–2 business days</strong>.
            </li>
            <li>
              Approved refunds are credited back to your original payment method
              within <strong>5–10 business days</strong>.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Cancellations
          </h2>
          <p>
            Orders can be cancelled within <strong>2 hours</strong> of placement
            for a full refund. After that, production begins and cancellations
            are no longer possible.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
          <p>
            Questions? Reach us at{" "}
            <a
              href="mailto:support@hangpho36.vn"
              className="text-black underline"
            >
              support@hangpho36.vn
            </a>{" "}
            or visit our{" "}
            <Link href="/" className="text-black underline">
              shop
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
