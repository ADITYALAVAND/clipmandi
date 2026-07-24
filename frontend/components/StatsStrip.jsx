const stats = [
  { val: "₹41.2L", valClass: "orange", lbl: "Paid to clippers · last 30 days" },
  { val: "6,340", valClass: "", lbl: "Active clippers on the floor" },
  { val: "312", valClass: "violet", lbl: "Campaigns live right now" },
  { val: "11 min", valClass: "yellow", lbl: "Avg. clip approval time" }
];

export default function StatsStrip() {
  return (
    <div className="stats-strip">
      {stats.map((s, i) => (
        <div className="stat-card" key={i}>
          <div className={`val ${s.valClass}`}>{s.val}</div>
          <div className="lbl">{s.lbl}</div>
        </div>
      ))}
    </div>
  );
}
