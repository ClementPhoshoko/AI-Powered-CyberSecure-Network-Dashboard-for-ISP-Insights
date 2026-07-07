import './ScanOverviewCard.css'

function ScanOverviewCard({ left, right, bottom = null }) {
  return (
    <section className="scan_overview-card">
      <div className="scan_overview-left">{left}</div>
      <div className="scan_overview-right">{right}</div>
      {bottom ? <div className="scan_overview-bottom">{bottom}</div> : null}
    </section>
  )
}

export default ScanOverviewCard
