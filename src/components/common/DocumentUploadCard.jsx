import { UploadIcon } from './Icons'

function DocumentUploadCard({
  icon,
  title,
  description,
  required = true,
  fileName,
  fileUrl,
  uploading = false,
  error,
  onUpload,
  onRemove,
}) {
  const isUploaded = Boolean(fileName || fileUrl)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onUpload?.(file)
    e.target.value = ''
  }

  return (
    <div
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
        error
          ? 'border-red-200 hover:border-red-300'
          : isUploaded
            ? 'border-green-200 hover:border-green-300'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-sm font-bold text-slate-900 md:text-[15px]">
              {title}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                required
                  ? 'bg-blue-50 text-[#005fd6]'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {required ? 'Required' : 'Optional'}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 md:text-sm">
            {description}
          </p>
        </div>
      </div>

      {isUploaded ? (
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                ✓
              </span>
              <div className="min-w-0">
                {fileName && (
                  <p className="m-0 truncate text-sm font-medium text-slate-800">{fileName}</p>
                )}
                {fileUrl && (
                  <p className="m-0 truncate text-xs text-slate-500" title={fileUrl}>
                    {fileUrl}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={uploading}
              className="shrink-0 text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          className={`flex w-full flex-col items-center gap-2.5 px-5 py-8 transition ${
            uploading ? 'cursor-wait bg-slate-50/50' : 'cursor-pointer hover:bg-blue-50/30'
          }`}
        >
          <input
            type="file"
            className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              uploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-[#005fd6]'
            }`}
          >
            {uploading ? (
              <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z" />
              </svg>
            ) : (
              <UploadIcon className="h-6 w-6" />
            )}
          </div>
          <span className={`text-sm font-semibold ${uploading ? 'text-slate-500' : 'text-[#005fd6]'}`}>
            {uploading ? 'Uploading to secure storage...' : 'Tap to upload PDF or Image'}
          </span>
          <span className="text-xs text-slate-400">PDF or image only · Max 10MB</span>
        </label>
      )}

      {error && (
        <p className="m-0 border-t border-red-100 bg-red-50/50 px-5 py-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default DocumentUploadCard
