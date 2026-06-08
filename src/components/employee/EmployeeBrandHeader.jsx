import { ShieldLogoIcon } from '../common/Icons'

function EmployeeBrandHeader({ badge = 'Professional Trust Platform' }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-b from-[#2747b2] to-[#1a3a8f] shadow-lg shadow-blue-900/20"
        aria-hidden="true"
      >
        <ShieldLogoIcon />
      </div>
      <h1 className="m-0 text-2xl font-extrabold tracking-tight text-[#1a3a8f]">
        VeriWork
      </h1>
      {badge && (
        <span className="mt-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500">
          {badge}
        </span>
      )}
    </div>
  )
}

export default EmployeeBrandHeader
