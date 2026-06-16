import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Loader from '../common/Loader'
import Button from '../common/Button'
import TrustScoreDisplay from './TrustScoreDisplay'
import EmploymentStatusBadge from './EmploymentStatusBadge'
import VerificationRequestModal from './VerificationRequestModal'
import { getInitials, formatDate } from '../../utils/formatters'
import {
  enterpriseKeys,
  fetchEmployeeProfile,
  createAccessRequest,
} from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

const ACCESS_REQUEST_TYPES = [
  { value: 'profile_access', label: 'Profile Access (documents & history)' },
  { value: 'verification_data', label: 'Verification Data' },
  { value: 'background_check', label: 'Background Check' },
]

function EmployeeProfileDrawer({ employeeId, onClose }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [verifyJob, setVerifyJob] = useState(null)
  const [requestType, setRequestType] = useState('profile_access')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: enterpriseKeys.employeeProfile(employeeId),
    queryFn: () => fetchEmployeeProfile(employeeId),
    enabled: Boolean(employeeId),
  })

  const preview = data?.preview
  const detailed = data?.detailedProfile

  const accessMutation = useMutation({
    mutationFn: () =>
      createAccessRequest({ employeeId, requestType }),
    onSuccess: () => {
      toast('Access request sent', 'success')
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.employeeProfile(employeeId) })
    },
    onError: (err) => toast(err.message || 'Failed to send request', 'error'),
  })

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="m-0 text-lg font-extrabold text-slate-900">Employee Profile</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          {isLoading && <Loader variant="inline" label="Loading profile..." />}
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
          )}

          {!isLoading && !error && !preview && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
              <p className="m-0 text-sm font-semibold text-slate-600">Could not load profile preview.</p>
              <Button type="button" className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {preview && !isLoading && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold text-[#1a3a8f]">
                  {getInitials(preview.name)}
                </div>
                <div className="min-w-0">
                  <h4 className="m-0 text-xl font-extrabold text-slate-900">{preview.name}</h4>
                  <p className="mt-0.5 text-sm text-slate-500">{preview.role}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {preview.employmentStatus && (
                      <EmploymentStatusBadge status={preview.employmentStatus} />
                    )}
                    {preview.isVerified && (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase text-green-700">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Trust Score</p>
                  <div className="mt-2">
                    <TrustScoreDisplay score={preview.trustScore} />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">VeriWork ID</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{preview.veriworkId || '—'}</p>
                </div>
              </div>

              <dl className="m-0 grid gap-3 text-sm">
                {[
                  ['Department', preview.department],
                  ['Access Approved', preview.hasAccessApproval ? 'Yes' : 'No'],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5 border-b border-slate-100 pb-3 sm:flex-row sm:justify-between">
                    <dt className="font-semibold text-slate-500">{label}</dt>
                    <dd className="m-0 font-medium text-slate-900">{value || '—'}</dd>
                  </div>
                ))}
              </dl>

              {!detailed && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="m-0 text-sm font-semibold text-amber-900">
                    Request access to view detailed profile
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    The employee must approve before you can see employment history and documents.
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <label htmlFor="drawer-request-type" className="text-xs font-semibold text-amber-900">
                      Request type
                    </label>
                    <select
                      id="drawer-request-type"
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      disabled={accessMutation.isPending || preview.hasAccessApproval}
                      className="h-11 w-full rounded-xl border border-amber-200 bg-white px-3 text-sm outline-none focus:border-[#1a3a8f]"
                    >
                      {ACCESS_REQUEST_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {preview.hasAccessApproval ? (
                    <Button type="button" className="mt-4 w-full" onClick={() => refetch()} disabled={isLoading}>
                      Refresh Profile
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="mt-4 w-full"
                      onClick={() => accessMutation.mutate()}
                      disabled={accessMutation.isPending}
                    >
                      Request Profile Access
                    </Button>
                  )}
                </div>
              )}

              {detailed && (
                <>
                  {detailed.scoreRating && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Score Rating</p>
                      <p className="mt-2 text-lg font-extrabold text-[#1a3a8f]">{detailed.scoreRating}</p>
                    </div>
                  )}

                  {detailed.verificationStatus && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification Status</p>
                      <div className="mt-3 grid gap-2 text-sm">
                        {Object.entries(detailed.verificationStatus).map(([key, val]) => (
                          <div key={key} className="flex justify-between gap-2">
                            <span className="font-medium capitalize text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-semibold text-slate-900">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailed.employmentHistory?.length > 0 && (
                    <div>
                      <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employment History</p>
                      <div className="mt-3 flex flex-col gap-3">
                        {detailed.employmentHistory.map((job) => (
                          <article key={job._id || job.id || `${job.company}-${job.title}`} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="m-0 font-bold text-slate-900">{job.title}</p>
                                <p className="m-0 mt-0.5 text-sm text-slate-600">{job.company}</p>
                                <p className="m-0 mt-1 text-xs text-slate-400">
                                  {formatDate(job.startDate)} – {job.endDate ? formatDate(job.endDate) : 'Present'}
                                </p>
                              </div>
                              {job.status && (
                                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                                  {job.status}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setVerifyJob({ ...job, employeeId })}
                              className="mt-3 text-sm font-semibold text-[#1a3a8f] hover:underline"
                            >
                              Start Verification
                            </button>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailed.documentMetadata && (
                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                      <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Documents</p>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        {Object.entries(detailed.documentMetadata).map(([type, count]) => (
                          <div key={type} className="rounded-xl bg-slate-50 px-3 py-2">
                            <p className="m-0 text-xs capitalize text-slate-500">{type.replace(/_/g, ' ')}</p>
                            <p className="m-0 mt-0.5 text-lg font-extrabold text-slate-900">{count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {accessMutation.isPending && <Loader variant="overlay" label="Sending request..." />}
      </aside>

      {verifyJob && (
        <VerificationRequestModal
          employeeId={verifyJob.employeeId}
          jobExperienceId={verifyJob._id || verifyJob.id}
          jobTitle={verifyJob.title}
          companyName={verifyJob.company}
          onClose={() => setVerifyJob(null)}
        />
      )}
    </div>
  )
}

export default EmployeeProfileDrawer
