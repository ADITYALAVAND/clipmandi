"use client";

import { mockTicker } from "@/lib/mockData";

export default function TickerBoard({ items = mockTicker }) {
  // Render the list twice back-to-back so the CSS marquee loops seamlessly.
  const looped = [...items, ...items];

  return (
    <div className="ticker-wrap">
      <div className="ticker-head">
        <div className="ticker-head-left">
          <span className="dot"></span>
          <span>LIVE RATE BOARD</span>
        </div>
        <div className="ticker-head-right">
          <i></i><i></i><i></i>
        </div>
      </div>
      <div className="ticker-track-outer">
        <div className="ticker-track">
          {looped.map((item, i) => (
            <div className="ticker-item" key={i}>
              <span className="name">{item.name}</span>
              <span className={`stat ${item.up ? "up" : ""}`}>
                {item.up ? "▲" : "●"} {item.stat}
              </span>
              <span className="badge-mini">{item.chip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
