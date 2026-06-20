import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '../common/Button'
import Input from '../common/Input'
import Loader from '../common/Loader'
import { createVerificationRequest, enterpriseKeys, searchPlatformCompanies } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

function VerificationRequestModal({
  employeeId,
  jobExperienceId,
  jobTitle,
  companyName,
  previousCompanyOnPlatform = false,
  matchedPlatformCompany = null,
  onClose,
  onSuccess,
}) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [hrEmail, setHrEmail] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [hrName, setHrName] = useState('')
  const [companySearch, setCompanySearch] = useState('')
  const [selectedPlatformCompany, setSelectedPlatformCompany] = useState(matchedPlatformCompany)

  useEffect(() => {
    setSelectedPlatformCompany(matchedPlatformCompany)
  }, [matchedPlatformCompany])

  const isCaseA = Boolean(selectedPlatformCompany?.id || previousCompanyOnPlatform)

  const { data: searchResults, isFetching: searching } = useQuery({
    queryKey: ['platform-companies', companySearch],
    queryFn: () => searchPlatformCompanies(companySearch),
    enabled: companySearch.trim().length >= 2 && !isCaseA,
  })

  const companies = searchResults?.data?.companies || searchResults?.companies || []

  const mutation = useMutation({
    mutationFn: () =>
      createVerificationRequest({
        employeeId,
        jobExperienceId,
        ...(selectedPlatformCompany?.id ? { targetCompanyId: selectedPlatformCompany.id } : {}),
        ...(hrEmail.trim() ? { hrEmail: hrEmail.trim() } : {}),
        ...(managerEmail.trim() ? { managerEmail: managerEmail.trim() } : {}),
        ...(hrName.trim() ? { hrName: hrName.trim() } : {}),
      }),
    onSuccess: (res) => {
      const result = res?.data || res
      if (result?.alreadyVerified) {
        toast(result.message || 'Employment already verified — reusable record available', 'success')
      } else {
        toast(result.message || result.request?.message || 'Verification request submitted', 'success')
      }
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.verificationOutgoing })
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.employeeProfile(employeeId) })
      onSuccess?.(result)
      onClose()
    },
    onError: (err) => toast(err.message || 'Failed to submit request', 'error'),
  })

  const platformName = selectedPlatformCompany?.name || matchedPlatformCompany?.name || companyName

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Start Employment Verification</h3>

        {isCaseA ? (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Verify <strong>{jobTitle}</strong> at <strong>{companyName}</strong>.
            </p>
            <div className="mt-4 rounded-xl border border-[#1a3a8f]/20 bg-blue-50/50 px-4 py-3 text-sm">
              <p className="m-0 font-semibold text-[#1a3a8f]">Case A — Direct platform verification</p>
              <p className="m-0 mt-2 text-slate-700">
                <strong>{platformName}</strong> is registered on PagerLook.
              </p>
              <ol className="m-0 mt-3 list-decimal space-y-1 pl-4 text-xs text-slate-600">
                <li>Employee gets consent request</li>
                <li>After approve → {platformName} HR sees it in Incoming</li>
                <li>They verify → Employer Verified on profile</li>
              </ol>
            </div>
            {!matchedPlatformCompany && selectedPlatformCompany && (
              <button
                type="button"
                onClick={() => setSelectedPlatformCompany(null)}
                className="mt-2 text-xs font-semibold text-slate-500 underline"
              >
                Change selected company
              </button>
            )}
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Verify <strong>{jobTitle}</strong> at <strong>{companyName}</strong>.
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="m-0 font-semibold text-slate-900">Is {companyName} on PagerLook?</p>
              <p className="m-0 mt-1 text-xs text-slate-500">
                Search and select if registered — verification goes directly to their HR dashboard.
              </p>
              <input
                type="text"
                className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Search company name..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
              />
              {searching && <p className="m-0 mt-2 text-xs text-slate-400">Searching...</p>}
              {companies.length > 0 && (
                <ul className="m-0 mt-2 max-h-32 list-none overflow-y-auto rounded-lg border border-slate-200 bg-white p-0">
                  {companies.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlatformCompany(c)
                          setCompanySearch('')
                        }}
                        className="w-full border-0 bg-white px-3 py-2 text-left text-sm hover:bg-blue-50"
                      >
                        <span className="font-semibold text-slate-900">{c.name}</span>
                        {c.city && <span className="ml-2 text-xs text-slate-400">{c.city}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Or — Case B email verification
            </p>
            <div className="mt-3 flex flex-col gap-4">
              <Input
                id="hr-name"
                label="HR Contact Name"
                value={hrName}
                onChange={(e) => setHrName(e.target.value)}
                disabled={mutation.isPending}
                placeholder="Optional"
              />
              <Input
                id="hr-email"
                label="HR Email"
                type="email"
                value={hrEmail}
                onChange={(e) => setHrEmail(e.target.value)}
                disabled={mutation.isPending}
                placeholder="Required for email verification"
              />
              <Input
                id="manager-email"
                label="Manager Email"
                type="email"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                disabled={mutation.isPending}
                placeholder="Alternative contact"
              />
            </div>
          </>
        )}

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending
              ? 'Sending...'
              : isCaseA
                ? 'Request employee consent'
                : 'Send HR email verification'}
          </Button>
        </div>

        {mutation.isPending && <Loader variant="overlay" label="Submitting..." />}
      </div>
    </div>
  )
}

export default VerificationRequestModal
