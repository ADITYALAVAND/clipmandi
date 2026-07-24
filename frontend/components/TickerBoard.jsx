"use client";

export default function TickerBoard({ items = [] }) {
  if (!items || items.length === 0) {
    return (
      <div className="ticker-wrap">
        <div className="ticker-head">
          <div className="ticker-head-left">
            <span className="dot"></span>
            <span>LIVE RATE BOARD</span>
          </div>

          <div className="ticker-head-right">
            <i></i>
            <i></i>
            <i></i>
          </div>
        </div>

        <div className="ticker-track-outer">
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: "var(--text-dim)"
            }}
          >
            No live campaigns right now.
          </div>
        </div>
      </div>
    );
  }

  // Duplicate items so the ticker loops continuously.
  const looped = [...items, ...items];

  return (
    <div className="ticker-wrap">

      <div className="ticker-head">
        <div className="ticker-head-left">
          <span className="dot"></span>
          <span>LIVE RATE BOARD</span>
        </div>

        <div className="ticker-head-right">
          <i></i>
          <i></i>
          <i></i>
        </div>
      </div>

      <div className="ticker-track-outer">
        <div className="ticker-track">

          {looped.map((item, i) => (
            <div
              className="ticker-item"
              key={`${item.id || item.name}-${i}`}
            >
              <span className="name">
                {item.name}
              </span>

              <span className="stat up">
                ▲ {formatViews(item.views)} views
              </span>

              <span className="badge-mini">
                ₹{Number(item.cpm || 0).toLocaleString("en-IN")} CPM
              </span>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}

function formatViews(value) {
  const views = Number(value || 0);

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(0)}K`;
  }

  return String(views);
}