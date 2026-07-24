import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="topnav">
      <div className="logo">
        <div className="logo-mark">CM</div>ClipMandi
      </div>
      <div className="nav-links">
        <a href="#brands">For Brands</a>
        <a href="#clippers">For Clippers</a>
        <a href="#how">How it works</a>
        <a href="#">Pricing</a>
      </div>
      <div className="nav-cta">
        <a className="btn btn-ghost" href="#">Log in</a>
        <Link className="btn btn-primary" href="/brand">Post a campaign</Link>
      </div>
    </nav>
  );
}
