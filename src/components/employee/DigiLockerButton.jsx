function DigiLockerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="16" height="13" rx="2.5" fill="#fff" fillOpacity="0.2" stroke="#fff" strokeWidth="1.4" />
      <path d="M7 9h8M7 12h5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="15" cy="8" r="2" fill="#fff" />
    </svg>
  )
}

function DigiLockerButton({ onClick, disabled, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="flex h-[52px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#5b2d8e] to-[#7b3fa8] text-[15px] font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:from-[#4a2475] hover:to-[#6a3596] disabled:cursor-not-allowed disabled:opacity-55"
    >
      {loading ? (
        <>
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Connecting to DigiLocker...
        </>
      ) : (
        <>
          <DigiLockerIcon />
          Verify with DigiLocker
        </>
      )}
    </button>
  )
}

export default DigiLockerButton
