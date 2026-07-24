import Link from "next/link";

export default function Stalls() {
  return (
    <section className="stalls-section" id="brands">
      <div className="section-head">
        <span className="eyebrow-plain">TWO SIDES, ONE FLOOR</span>
        <h2>Bring your content. Or bring your edit.</h2>
      </div>
      <div className="stalls">
        <div className="stall brand">
          <div className="stall-tag">◆ FOR BRANDS &amp; CREATORS</div>
          <h3>List a campaign, watch it get cut.</h3>
          <p>
            Upload your raw footage, set your budget and CPM, and let thousands of Indian
            clippers turn it into short-form that actually spreads.
          </p>
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-body">
              <h4>Set your rate card</h4>
              <p>Decide your CPM, total budget, and which platforms qualify.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-body">
              <h4>Clips start rolling in</h4>
              <p>Review submissions in one inbox — approve, reject, or request an edit.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-body">
              <h4>Pay only for real views</h4>
              <p>Payouts are tied to verified, Tier-1 traffic — never bot views.</p>
            </div>
          </div>
          <Link className="btn btn-primary" href="/brand">Post your first campaign</Link>
        </div>

        <div className="stall-divider"></div>

        <div className="stall clipper" id="clippers">
          <div className="stall-tag">◆ FOR CLIPPERS</div>
          <h3>Pick a campaign. Get to cutting.</h3>
          <p>
            Browse live campaigns by CPM and category, submit your edit, and get paid
            straight to UPI the moment your views are verified.
          </p>
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-body">
              <h4>Browse the floor</h4>
              <p>Filter campaigns by payout rate, niche, and remaining budget.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-body">
              <h4>Post your clip</h4>
              <p>Submit your link, tag the brand, and track approval live.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-body">
              <h4>Cash out anytime</h4>
              <p>Earnings land in your ClipMandi wallet — withdraw to UPI in minutes.</p>
            </div>
          </div>
          <Link className="btn btn-primary" href="/clipper">Start browsing campaigns</Link>
        </div>
      </div>
    </section>
  );
}
