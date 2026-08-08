import { useEffect, useRef, useState } from 'react'
import { UploadIcon } from '../common/Icons'

const ACCEPTED = 'image/jpeg,image/jpg,image/png,image/webp'
const MAX_MB = 5

/**
 * Single-image picker for one side of the Aadhaar card. Shows a live preview so
 * the employee can see the side is readable before submitting — a blurry upload
 * is the most common reason an admin rejects a submission.
 */
function AadhaarImagePicker({ label, hint, file, onChange, disabled = false, error = '' }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return undefined
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleSelect = (event) => {
    const selected = event.target.files?.[0]
    event.target.value = ''
    if (!selected) return

    if (!ACCEPTED.split(',').includes(selected.type)) {
      setLocalError('Upload a JPG, PNG or WebP image')
      return
    }
    if (selected.size > MAX_MB * 1024 * 1024) {
      setLocalError(`Image must be under ${MAX_MB} MB`)
      return
    }

    setLocalError('')
    onChange(selected)
  }

  const message = localError || error
  const hasImage = Boolean(preview)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={`relative flex aspect-[8/5] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${
          message
            ? 'border-red-300 bg-red-50/60'
            : hasImage
              ? 'border-green-300 bg-green-50/40'
              : 'border-slate-200 bg-slate-50 hover:border-[#1e3a8a]/40 hover:bg-slate-100'
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {hasImage ? (
          <>
            <img src={preview} alt={`${label} preview`} className="h-full w-full object-contain" />
            {!disabled && (
              <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/75 px-3 py-1 text-[11px] font-semibold text-white">
                Change
              </span>
            )}
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 px-4 text-center">
            <UploadIcon className="h-7 w-7 text-slate-400" />
            <span className="text-sm font-semibold text-slate-600">Tap to upload</span>
            {hint && <span className="text-xs text-slate-400">{hint}</span>}
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        capture="environment"
        onChange={handleSelect}
        className="hidden"
      />

      {message && <p className="m-0 text-xs font-medium text-red-600">{message}</p>}
    </div>
  )
}

export default AadhaarImagePicker
