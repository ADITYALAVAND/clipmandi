import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero">
      <div className="eyebrow">
        <span className="dot"></span> ₹41.2L PAID OUT TO CLIPPERS THIS MONTH
      </div>
      <h1>
        Your content, cut a<br />
        thousand ways. <span className="grad">Paid in real time.</span>
      </h1>
      <p className="sub">
        ClipMandi is India&apos;s clip trading floor — brands list campaigns, thousands of
        clippers cut and post, and every qualified view turns into a payout. No middlemen,
        no waiting.
      </p>
      <div className="hero-ctas">
        <Link className="btn btn-primary btn-lg" href="/brand">Post a campaign →</Link>
        <Link className="btn btn-ghost btn-lg" href="/clipper">Browse campaigns</Link>
      </div>
      <div className="hero-note">No credit card to browse · UPI payouts · Instagram, YouTube &amp; TikTok</div>
    </section>
  );
}
