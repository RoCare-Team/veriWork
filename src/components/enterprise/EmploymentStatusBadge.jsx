import { getEmploymentStatusStyle } from '../../utils/enterpriseTeamUtils'

function EmploymentStatusBadge({ status }) {
  const style = getEmploymentStatusStyle(status)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  )
}

export default EmploymentStatusBadge
