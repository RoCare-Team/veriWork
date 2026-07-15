import { PhoneIcon } from '../common/Icons'
import { COUNTRY_CODES } from '../../utils/countryCodes'

function PhoneInput({
  label = 'Phone Number',
  countryCode,
  onCountryCodeChange,
  value,
  onChange,
  disabled = false,
  id = 'phone',
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <div className="relative shrink-0">
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            disabled={disabled}
            aria-label="Country code"
            className="h-12 w-[108px] appearance-none rounded-xl border border-slate-300 bg-white pl-3 pr-8 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#005fd6] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 md:h-[52px] md:w-[118px] md:text-base"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.country}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
        </div>

        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <PhoneIcon className="h-[18px] w-[18px]" />
          </span>
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            value={value}
            onChange={onChange}
            disabled={disabled}
            autoComplete="tel-national"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#005fd6] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 md:h-[52px] md:text-base"
          />
        </div>
      </div>
    </div>
  )
}

export default PhoneInput
