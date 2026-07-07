import { useEffect, useMemo, useState } from 'react'
import InsightsHistorySection from '../../../components/insights_history_section/InsightsHistorySection'
import './InsightsPanel.css'

function InsightsPanel({ assessments = [], latestAssessment = null, isLoading = false, error = null }) {
  const assessmentList = useMemo(() => {
    if (!Array.isArray(assessments)) {
      return []
    }

    return assessments.filter(Boolean)
  }, [assessments])

  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null)

  useEffect(() => {
    if (!assessmentList.length) {
      if (selectedAssessmentId !== null) {
        setSelectedAssessmentId(null)
      }
      return
    }

    // Keep collapsed state if user explicitly closed the selected row.
    if (selectedAssessmentId === null) {
      return
    }

    if (assessmentList.some((item) => item?.id === selectedAssessmentId)) {
      return
    }

    setSelectedAssessmentId(null)
  }, [assessmentList, latestAssessment?.id, selectedAssessmentId])

  const selectedAssessment = useMemo(() => {
    if (!assessmentList.length) {
      return null
    }

    return assessmentList.find((item) => item?.id === selectedAssessmentId) || latestAssessment || assessmentList[0]
  }, [assessmentList, latestAssessment, selectedAssessmentId])

  return (
    <section className="insights_panel" aria-label="Security scan insights panel">
      <header className="insights_panel-head">
        <div>
          <h2 className="insights_panel-title">Scan History and Trends</h2>
          <p className="insights_panel-subtitle">
            Click any recent scan below to preview its overall results inline.
          </p>
        </div>
      </header>

      <InsightsHistorySection
        assessments={assessmentList}
        isLoading={isLoading}
        error={error}
        selectedAssessmentId={selectedAssessment?.id || null}
        onSelectAssessment={setSelectedAssessmentId}
      />
    </section>
  )
}

export default InsightsPanel
