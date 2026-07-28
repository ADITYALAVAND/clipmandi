import Link from "next/link";

export default function Footer() {
  return (
    <footer id="how">
      <div className="footer-cta">
        <h2>The floor is open.</h2>

        <p>
          Whether you&apos;re bringing footage or bringing skill,
          there&apos;s a stall for you.
        </p>

        <div className="hero-ctas">
          <Link
            className="btn btn-primary btn-lg"
            href="/register"
          >
            Join as a Creator
          </Link>

          <Link
            className="btn btn-ghost btn-lg"
            href="/register"
          >
            Join as a Clipper
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© 2026 ClipMandi Technologies Pvt Ltd</div>
        <div>Made for India&apos;s creator economy</div>
      </div>
    </footer>
  );
}