import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import VaultCategoryCard from '../../components/employee/VaultCategoryCard'
import { ShieldCheckIcon, DocumentIcon } from '../../components/common/Icons'
import { isVerificationComplete } from '../../store/employeeStore'
import { VAULT_STORAGE, VAULT_CATEGORIES, RECENT_DOCUMENTS } from '../../utils/employeePortalData'

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function DocumentVault() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isVerificationComplete()) {
      navigate('/employee/verification', { replace: true })
    }
  }, [navigate])

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Document Vault"
        subtitle="Securely store and manage your verified documents"
      />

      <div className="rounded-3xl bg-gradient-to-br from-[#1a3a8f] via-[#2747b2] to-[#152b6e] p-5 text-white shadow-xl shadow-blue-900/20 md:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="m-0 text-sm text-white/70 md:text-base">Vault Storage</p>
            <p className="m-0 mt-1 text-2xl font-extrabold md:text-3xl">
              {VAULT_STORAGE.used} <span className="text-lg font-semibold text-white/60">of {VAULT_STORAGE.total} used</span>
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-green-400 transition-all"
                style={{ width: `${VAULT_STORAGE.percent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/65 md:text-sm">
              <span>{VAULT_STORAGE.percent}% Used</span>
              <span>Encrypted & Secure</span>
            </div>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 md:h-14 md:w-14">
            <ShieldCheckIcon className="h-6 w-6 md:h-7 md:w-7" />
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="m-0 mb-4 text-sm font-bold text-slate-800 md:text-base">Categories</h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {VAULT_CATEGORIES.map((cat) => (
            <VaultCategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-sm font-bold text-slate-800 md:text-base">Recent Documents</h2>
          <button type="button" className="text-sm font-semibold text-[#1a3a8f] hover:underline">
            View All
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {RECENT_DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1a3a8f]">
                <DocumentIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm font-bold text-slate-900 md:text-base">{doc.name}</p>
                <p className="m-0 mt-0.5 text-xs text-slate-500 md:text-sm">
                  {doc.size} &bull; {doc.date}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                Verified
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex justify-end lg:mt-10">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#1a3a8f] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#152b6e] md:px-6 md:text-base">
          <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" />
          <PlusIcon />
          Upload File
        </label>
      </div>

      <div className="mt-4 text-center lg:hidden">
        <Link
          to="/employee/job-history/add"
          className="text-sm font-semibold text-[#1a3a8f] no-underline hover:underline"
        >
          Upload experience documents →
        </Link>
      </div>
    </EmployeeLayout>
  )
}

export default DocumentVault
