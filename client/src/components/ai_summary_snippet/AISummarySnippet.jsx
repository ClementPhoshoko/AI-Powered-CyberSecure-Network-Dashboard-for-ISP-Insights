import './AISummarySnippet.css'

function AISummarySnippet({ summary }) {
  if (!summary) {
    return null
  }

  return (
    <section className="ai_summary_snippet" aria-label="AI security summary">
      <h3 className="ai_summary_snippet-title">AI Summary</h3>
      <p className="ai_summary_snippet-text">{summary}</p>
    </section>
  )
}

export default AISummarySnippet
