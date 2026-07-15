function SectionTitle({ children }) {
  return (
    <h2 className="m-0 flex items-center gap-2 text-base font-bold text-slate-900 md:text-lg">
      <span className="inline-block h-5 w-1 rounded-full bg-[#005fd6]" />
      {children}
    </h2>
  )
}

export default SectionTitle
