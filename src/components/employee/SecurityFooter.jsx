import { LockIcon, ShieldCheckIcon } from '../common/Icons'

function SecurityFooter({ variant = 'lock', text }) {
  const Icon = variant === 'shield' ? ShieldCheckIcon : LockIcon

  return (
    <p className="m-0 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
      <Icon className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </p>
  )
}

export default SecurityFooter
