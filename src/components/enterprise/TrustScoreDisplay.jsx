import { getTrustScoreStyle } from '../../utils/enterpriseTeamUtils'

function TrustScoreDisplay({ score, compact = false }) {
  const style = getTrustScoreStyle(score)
  if (compact) {
    return <span className={`text-lg font-extrabold ${style.color}`}>{score ?? '—'}</span>
  }
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg font-extrabold ${style.color}`}>{score ?? '—'}</span>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.bg} ${style.color}`}>
        {style.label}
      </span>
    </div>
  )
}

export default TrustScoreDisplay
