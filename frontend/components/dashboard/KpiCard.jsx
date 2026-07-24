export default function KpiCard({ icon, iconBg, trend, value, label }) {
  return (
    <div className="kcard">
      <div className="top">
        <div className="ic" style={{ background: iconBg }}>{icon}</div>
        {trend && <span className="trend">{trend}</span>}
      </div>
      <div className="val">{value}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}
