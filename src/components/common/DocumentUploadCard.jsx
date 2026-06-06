import { UploadIcon } from './Icons'

function DocumentUploadCard({
  icon,
  title,
  description,
  required = true,
  fileName,
  onUpload,
  onRemove,
}) {
  const isUploaded = Boolean(fileName)

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        isUploaded
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
                  ? 'bg-blue-50 text-[#1a3a8f]'
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
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
              ✓
            </span>
            <span className="truncate text-sm font-medium text-slate-800">
              {fileName}
            </span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-xs font-semibold text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onUpload}
          className="flex w-full flex-col items-center gap-2.5 px-5 py-8 transition hover:bg-blue-50/30"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#1a3a8f]">
            <UploadIcon className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold text-[#1a3a8f]">
            Tap to upload PDF or Image
          </span>
          <span className="text-xs text-slate-400">Max file size 10MB</span>
        </button>
      )}
    </div>
  )
}

export default DocumentUploadCard
