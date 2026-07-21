function PlusCircleIcon({ uploaded }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
        uploaded
          ? 'border-green-200 bg-green-50 text-green-600'
          : 'border-slate-200 bg-slate-50 text-[#1e3a8a] hover:border-[#1e3a8a]/30 hover:bg-blue-50'
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 4v10M4 9h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  )
}

const DOC_ICONS = {
  document: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 2h6l4 4v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v4h4M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  receipt: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3h10v14l-2-1.5L11 17l-2-1.5L7 17l-2-1.5L5 17V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 7h4M8 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  clipboard: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3.5h4a1 1 0 0 1 1 1V5H7V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 9h4M8 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  badge: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="10" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 8.5h4M12 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
}

function ExperienceDocumentCard({ doc, fileName, onUpload }) {
  const uploaded = Boolean(fileName)

  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1e3a8a]">
        {DOC_ICONS[doc.icon]}
      </div>

      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-bold text-slate-900 md:text-base">{doc.title}</p>
        <p className={`m-0 mt-0.5 truncate text-xs md:text-sm ${uploaded ? 'font-medium text-green-600' : 'text-slate-400'}`}>
          {uploaded ? fileName : 'Not uploaded'}
        </p>
      </div>

      <label className="relative cursor-pointer">
        <input
          type="file"
          className="sr-only"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(doc.id, file)
          }}
        />
        <PlusCircleIcon uploaded={uploaded} />
      </label>
    </div>
  )
}

export default ExperienceDocumentCard
