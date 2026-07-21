import { useEffect, useRef } from 'react'

const OTP_LENGTH = 6

function OtpInput({ value, onChange, disabled = false }) {
  const inputsRef = useRef([])

  const digits = value.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split('')

  useEffect(() => {
    if (!disabled) inputsRef.current[0]?.focus()
  }, [disabled])

  const updateDigit = (index, char) => {
    if (!/^\d?$/.test(char)) return
    const next = digits.map((d, i) => (i === index ? char : d.trim())).join('').replace(/\s/g, '')
    onChange(next.slice(0, OTP_LENGTH))
    if (char && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (pasted) {
      onChange(pasted)
      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
      inputsRef.current[focusIndex]?.focus()
    }
  }

  return (
    <div>
      <p className="m-0 mb-3 text-sm font-semibold text-slate-800">Enter OTP</p>
      <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputsRef.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit.trim()}
            disabled={disabled}
            aria-label={`Digit ${index + 1}`}
            onChange={(e) => updateDigit(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="h-12 w-full max-w-[52px] rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-slate-900 outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 sm:h-14 sm:max-w-[56px] sm:text-xl"
          />
        ))}
      </div>
    </div>
  )
}

export default OtpInput
