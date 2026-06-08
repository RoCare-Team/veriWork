import { Link } from 'react-router-dom'
import { ChevronRightIcon } from '../common/Icons'

function SettingsRow({ icon, title, subtitle, to, onClick, action }) {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-bold text-slate-900 md:text-base">{title}</p>
        {subtitle && <p className="m-0 mt-0.5 text-xs text-slate-500 md:text-sm">{subtitle}</p>}
      </div>
      {action || <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />}
    </>
  )

  const className =
    'flex w-full items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200 hover:shadow-md md:p-5'

  if (to) {
    return (
      <Link to={to} className={`${className} no-underline`}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={`${className} text-left`}>
      {content}
    </button>
  )
}

export default SettingsRow
