import './ScanLoadingSkeleton.css'

function ScanLoadingSkeleton() {
  return (
    <div className="scan_loading_skeleton" aria-hidden="true">
      <div className="scan_loading_skeleton-block scan_loading_skeleton-block-lg" />
      <div className="scan_loading_skeleton-block" />
      <div className="scan_loading_skeleton-grid">
        <div className="scan_loading_skeleton-block" />
        <div className="scan_loading_skeleton-block" />
      </div>
    </div>
  )
}

export default ScanLoadingSkeleton
