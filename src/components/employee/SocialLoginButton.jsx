import { ChevronRightIcon } from '../common/Icons'

function SocialLoginButton({ icon, children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[52px] w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-[15px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-55"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left">{children}</span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
    </button>
  )
}

export default SocialLoginButton
