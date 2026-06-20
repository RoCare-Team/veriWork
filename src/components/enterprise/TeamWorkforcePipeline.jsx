import { Link, useNavigate } from 'react-router-dom'
import { getInitials, formatDate } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'
import {
  getEmployeeProfilePath,
  getEmployeeVerifyPath,
  getOnboardingStageStyle,
  resolveEmployeeId,
} from '../../utils/enterpriseTeamUtils'
import { getTrustScoreStyle } from '../../utils/enterpriseTeamUtils'
import { SCORE_MAX } from '../../utils/employeeScoreUtils'

const STAGE_ACTIONS = {
  incoming: { label: 'Request profile access', variant: 'primary' },
  pending_verification: { label: 'Start verification', variant: 'primary' },
  verified: { label: 'Assign department', variant: 'success' },
  active: { label: 'View profile', variant: 'neutral' },
}

function MiniScoreRing({ score, max = SCORE_MAX }) {
  const style = getTrustScoreStyle(score)
  const pct = max > 0 ? Math.min(100, ((Number(score) || 0) / max) * 100) : 0
  const r = 18
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="relative h-11 w-11 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="currentColor"
          className={style.color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-extrabold ${style.color}`}>
        {score ?? '—'}
      </span>
    </div>
  )
}

function PipelineEmployeeCard({
  employee,
  stage,
  onRequestAccess,
  onAssign,
  compact = false,
}) {
  const navigate = useNavigate()
  const id = resolveEmployeeId(employee)
  const name = employee.employeeName || employee.name || 'Employee'
  const role = employee.designation || employee.role || '—'
  const department = employee.department || 'Unassigned'
  const photoSrc = mediaUrl(employee.photoUrl || employee.profilePhoto)
  const stageStyle = getOnboardingStageStyle(stage || employee.onboardingStage)
  const action = STAGE_ACTIONS[stage || employee.onboardingStage] || STAGE_ACTIONS.incoming
  const profilePath = getEmployeeProfilePath(employee)
  const verifyPath = getEmployeeVerifyPath(id)

  const handlePrimary = () => {
    if (stage === 'verified' || employee.onboardingStage === 'verified') {
      onAssign?.(employee)
      return
    }
    if (stage === 'pending_verification' || employee.onboardingStage === 'pending_verification') {
      if (verifyPath) navigate(verifyPath)
      return
    }
    if (stage === 'incoming' || employee.onboardingStage === 'incoming') {
      onRequestAccess?.(employee)
      return
    }
    if (profilePath) navigate(profilePath)
  }

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-[#1a3a8f]/30 hover:shadow-md ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1a3a8f] via-[#3b5cc4] to-[#1a3a8f] opacity-0 transition group-hover:opacity-100" />

      <div className="flex gap-4">
        {photoSrc ? (
          <img src={photoSrc} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-slate-100" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a3a8f] to-[#2747b2] text-lg font-bold text-white">
            {getInitials(name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="m-0 truncate text-base font-extrabold text-slate-900">{name}</h3>
              <p className="m-0 mt-0.5 text-sm text-slate-600">{role}</p>
              <p className="m-0 mt-0.5 text-xs text-slate-400">{department}</p>
            </div>
            {!compact && employee.trustScore != null && (
              <MiniScoreRing score={employee.trustScore} max={employee.trustScoreMax || SCORE_MAX} />
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${stageStyle.bg} ${stageStyle.color}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${stageStyle.dot}`} />
              {stageStyle.label}
            </span>
            {employee.joinedAt && (
              <span className="text-[10px] text-slate-400">Joined {formatDate(employee.joinedAt)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={handlePrimary}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            action.variant === 'success'
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : action.variant === 'primary'
                ? 'bg-[#1a3a8f] text-white hover:bg-[#152b6e]'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {action.label}
        </button>
        {profilePath && (
          <Link
            to={profilePath}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 no-underline transition hover:bg-slate-50"
          >
            View profile
          </Link>
        )}
      </div>
    </article>
  )
}

function PipelineColumn({ title, subtitle, count, accent, children, emptyText }) {
  return (
    <section className={`flex flex-col rounded-2xl border ${accent.border} ${accent.bg} p-5`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${accent.iconBg} text-sm`}>
              {accent.icon}
            </span>
            <h2 className="m-0 text-base font-extrabold text-slate-900">{title}</h2>
          </div>
          <p className="m-0 mt-1 text-xs text-slate-600">{subtitle}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${accent.badge}`}>{count}</span>
      </div>
      {children?.length ? (
        <div className="flex flex-col gap-3">{children}</div>
      ) : (
        <p className="m-0 rounded-xl border border-dashed border-slate-200/80 bg-white/60 px-4 py-8 text-center text-xs text-slate-500">
          {emptyText}
        </p>
      )}
    </section>
  )
}

export function TeamWorkforcePipeline({
  incoming = [],
  verified = [],
  active = [],
  allEmployees = [],
  onRequestAccess,
  onAssign,
}) {
  const enrich = (q) => {
    const linked = allEmployees.find((e) => resolveEmployeeId(e) === q.employeeId)
    return { ...linked, ...q }
  }

  const incomingList = incoming.map(enrich)
  const verifiedList = verified.map(enrich)
  const activeList = active.length
    ? active.map(enrich)
    : allEmployees.filter((e) => e.onboardingStage === 'active' || !e.onboardingStage)

  return (
    <div className="mb-10">
      <div className="mb-5">
        <h2 className="m-0 text-lg font-extrabold text-slate-900">Workforce pipeline</h2>
        <p className="m-0 mt-1 text-sm text-slate-500">
          Invite → Access consent → Verify previous job → Assign department → Active team
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <PipelineColumn
          title="Incoming"
          subtitle="Awaiting profile access & consent"
          count={incomingList.length}
          accent={{
            border: 'border-amber-200/80',
            bg: 'bg-gradient-to-b from-amber-50/80 to-white',
            iconBg: 'bg-amber-100 text-amber-700',
            badge: 'bg-amber-100 text-amber-800',
            icon: '①',
          }}
          emptyText="No employees awaiting access"
        >
          {incomingList.map((emp) => (
            <PipelineEmployeeCard
              key={emp.employeeId}
              employee={emp}
              stage="incoming"
              onRequestAccess={onRequestAccess}
              compact
            />
          ))}
        </PipelineColumn>

        <PipelineColumn
          title="Pending verification"
          subtitle="Access granted — verify previous employment"
          count={allEmployees.filter((e) => e.onboardingStage === 'pending_verification').length}
          accent={{
            border: 'border-orange-200/80',
            bg: 'bg-gradient-to-b from-orange-50/60 to-white',
            iconBg: 'bg-orange-100 text-orange-700',
            badge: 'bg-orange-100 text-orange-800',
            icon: '②',
          }}
          emptyText="No employees pending verification"
        >
          {allEmployees
            .filter((e) => e.onboardingStage === 'pending_verification')
            .map((emp) => (
              <PipelineEmployeeCard
                key={resolveEmployeeId(emp)}
                employee={emp}
                stage="pending_verification"
                compact
              />
            ))}
        </PipelineColumn>

        <PipelineColumn
          title="Ready to assign"
          subtitle="Verified — assign department & role"
          count={verifiedList.length}
          accent={{
            border: 'border-emerald-200/80',
            bg: 'bg-gradient-to-b from-emerald-50/60 to-white',
            iconBg: 'bg-emerald-100 text-emerald-700',
            badge: 'bg-emerald-100 text-emerald-800',
            icon: '③',
          }}
          emptyText="No verified employees waiting"
        >
          {verifiedList.map((emp) => (
            <PipelineEmployeeCard
              key={emp.employeeId}
              employee={emp}
              stage="verified"
              onAssign={onAssign}
              compact
            />
          ))}
        </PipelineColumn>
      </div>
    </div>
  )
}

export default PipelineEmployeeCard
