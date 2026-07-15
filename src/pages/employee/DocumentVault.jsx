import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import VaultCategoryCard from '../../components/employee/VaultCategoryCard'
import Loader from '../../components/common/Loader'
import { ShieldCheckIcon, DocumentIcon } from '../../components/common/Icons'
import { employeeKeys, fetchVault, uploadVaultDocument } from '../../api/employee'
import { mapVaultCategories } from '../../utils/employeeApiUtils'

const FALLBACK_CATEGORIES = [
  { id: 'identity', label: 'Identity', icon: 'id', color: 'blue', files: 0 },
  { id: 'education', label: 'Education', icon: 'education', color: 'purple', files: 0 },
  { id: 'experience', label: 'Experience', icon: 'briefcase', color: 'green', files: 0 },
  { id: 'financial', label: 'Financial', icon: 'wallet', color: 'orange', files: 0 },
]

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DocumentVault() {
  const queryClient = useQueryClient()
  const [uploadCategory, setUploadCategory] = useState('identity')
  const [uploadError, setUploadError] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: employeeKeys.vault,
    queryFn: fetchVault,
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, category }) =>
      uploadVaultDocument({
        category,
        name: file.name,
        file,
        size: formatSize(file.size),
      }),
    onSuccess: () => {
      setUploadError('')
      queryClient.invalidateQueries({ queryKey: employeeKeys.vault })
    },
    onError: (err) => setUploadError(err.message || 'Upload failed'),
  })

  const items = data?.items || []
  const categories = useMemo(() => {
    if (Array.isArray(data?.categories) && data.categories.length) return mapVaultCategories(data.categories)
    if (!items.length) return FALLBACK_CATEGORIES
    return FALLBACK_CATEGORIES.map((cat) => ({
      ...cat,
      files: items.filter((d) => d.category === cat.id).length,
    }))
  }, [data?.categories, items])

  const recentDocs = useMemo(
    () =>
      [...(data?.recentDocuments || items)]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [data?.recentDocuments, items],
  )

  const totalDocs = data?.summary?.totalDocuments ?? items.length
  const verifiedCount = data?.summary?.verifiedCount ?? items.filter((d) => d.status === 'verified').length
  const storagePercent = totalDocs > 0 ? Math.min(100, Math.round((totalDocs / 20) * 100)) : 0

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadMutation.mutate({ file, category: uploadCategory })
    e.target.value = ''
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading vault..." />

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Document Vault" subtitle="Securely store and manage your verified documents" />
      {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

      <div className="rounded-3xl bg-gradient-to-br from-[#005fd6] via-[#0073fe] to-[#004bab] p-5 text-white shadow-xl shadow-blue-900/20 md:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="m-0 text-sm text-white/70 md:text-base">Vault Storage</p>
            <p className="m-0 mt-1 text-2xl font-extrabold md:text-3xl">
              {totalDocs} <span className="text-lg font-semibold text-white/60">documents</span>
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${storagePercent}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/65 md:text-sm">
              <span>{verifiedCount} verified</span>
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
          {categories.map((cat) => (
            <VaultCategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-sm font-bold text-slate-800 md:text-base">Recent Documents</h2>
        </div>
        <div className="flex flex-col gap-3">
          {recentDocs.length > 0 ? (
            recentDocs.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#005fd6]">
                  <DocumentIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-sm font-bold text-slate-900 md:text-base">{doc.name}</p>
                  <p className="m-0 mt-0.5 text-xs text-slate-500 md:text-sm">
                    {doc.size || doc.category} &bull; {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    doc.status === 'verified' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {doc.status === 'verified' ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No documents uploaded yet
            </p>
          )}
        </div>
      </section>

      <div className="mt-8 flex flex-col items-end gap-3 lg:mt-10">
        <select
          value={uploadCategory}
          onChange={(e) => setUploadCategory(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#005fd6] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#004bab] md:px-6 md:text-base">
          <input
            type="file"
            className="sr-only"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
          />
          <PlusIcon />
          {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
        </label>
      </div>

      <div className="mt-4 text-center lg:hidden">
        <Link to="/employee/job-history/add" className="text-sm font-semibold text-[#005fd6] no-underline hover:underline">
          Upload experience documents →
        </Link>
      </div>
    </EmployeeLayout>
  )
}

export default DocumentVault
