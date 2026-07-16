import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Button from '../common/Button'
import Input from '../common/Input'
import Loader from '../common/Loader'
import { inviteEmployee, searchCompanyEmployees } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

const TABS = [
  { id: 'search', label: 'Search on PagerLook' },
  { id: 'link', label: 'Invite by link' },
]

function EmployeeInitial({ name, photoUrl }) {
  if (photoUrl) {
    return <img src={photoUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#005fd6]/10 text-sm font-bold text-[#005fd6]">
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function InviteEmployeeModal({ onClose, onSuccess, defaultDepartment = '' }) {
  const { toast } = useToast()
  const [tab, setTab] = useState('search')

  // Shared role fields
  const [department, setDepartment] = useState(defaultDepartment)
  const [designation, setDesignation] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Search (registered) mode
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const debouncedQuery = useDebouncedValue(searchQuery, 300)

  // Link (new employee) mode
  const [employeeName, setEmployeeName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [linkResult, setLinkResult] = useState(null)
  const [copied, setCopied] = useState(false)

  // A "complete" identifier: full email, a PagerLook ID (has a dash), or a 10-digit mobile.
  const queryDigits = debouncedQuery.replace(/\D/g, '')
  const looksComplete =
    (debouncedQuery.includes('@') && debouncedQuery.includes('.')) ||
    debouncedQuery.includes('-') ||
    queryDigits.length >= 10

  const { data: searchData, isFetching: searching } = useQuery({
    queryKey: ['company', 'employee-search', debouncedQuery],
    queryFn: () => searchCompanyEmployees(debouncedQuery),
    enabled: tab === 'search' && looksComplete && !selectedEmployee,
  })
  const results = searchData?.data?.employees || searchData?.employees || []

  const roleValid = department.trim() && designation.trim()

  const inviteMutation = useMutation({
    mutationFn: (body) => inviteEmployee(body),
    onError: (err) => {
      if (err?.status === 409) {
        toast('Pending invitation already exists for this employee', 'error')
        return
      }
      toast(err.message || 'Failed to send invitation', 'error')
    },
  })

  const validateRole = () => {
    const next = {}
    if (!department.trim()) next.department = 'Department is required'
    if (!designation.trim()) next.designation = 'Designation is required'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  // Registered employee → invitation lands in their portal
  const handleSendToRegistered = () => {
    if (!selectedEmployee || !validateRole()) return
    inviteMutation.mutate(
      {
        employeeName: selectedEmployee.name || 'Employee',
        ...(selectedEmployee.veriworkId ? { employeePagerlookId: selectedEmployee.veriworkId } : {}),
        department: department.trim(),
        designation: designation.trim(),
      },
      {
        onSuccess: (res) => {
          const data = res?.data || res
          toast(`Invitation sent to ${selectedEmployee.name}. They'll accept it from their portal.`, 'success')
          onSuccess?.(data)
          onClose()
        },
      },
    )
  }

  // New employee → generate a shareable registration link
  const handleGenerateLink = (e) => {
    e.preventDefault()
    const next = {}
    if (!employeeName.trim()) next.employeeName = 'Employee name is required'
    if (!mobile.trim()) next.employeeMobile = 'Mobile number is required'
    else if (mobile.replace(/\D/g, '').length < 10) next.employeeMobile = 'Enter a valid mobile number'
    if (!department.trim()) next.department = 'Department is required'
    if (!designation.trim()) next.designation = 'Designation is required'
    setFieldErrors(next)
    if (Object.keys(next).length > 0) return

    inviteMutation.mutate(
      {
        employeeName: employeeName.trim(),
        employeeMobile: mobile.trim(),
        ...(email.trim() ? { employeeEmail: email.trim() } : {}),
        department: department.trim(),
        designation: designation.trim(),
      },
      {
        onSuccess: (res) => {
          const data = res?.data || res
          setLinkResult(data)
          if (data.caseType === 'registered') {
            // The person turned out to be registered — invite landed in their portal.
            toast('This person is already on PagerLook — invitation sent to their portal.', 'success')
            onSuccess?.(data)
            onClose()
            return
          }
          if (email.trim() && data.emailSent && !data.emailMock) {
            toast(`Registration link emailed to ${email.trim()}`, 'success')
          } else {
            toast('Invite link generated — copy and share it.', 'success')
          }
          onSuccess?.(data)
        },
      },
    )
  }

  const copyLink = async () => {
    if (!linkResult?.registrationLink) return
    try {
      await navigator.clipboard.writeText(linkResult.registrationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Could not copy — select and copy the link manually.', 'error')
    }
  }

  const switchTab = (next) => {
    setTab(next)
    setFieldErrors({})
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <h3 className="m-0 pr-10 text-lg font-extrabold text-slate-900">Invite Employee</h3>
        <p className="mt-1 text-sm text-slate-500">
          Search a registered employee to invite them directly, or generate a link to share with
          someone new.
        </p>

        {/* Tabs */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ---- Search (registered) ---- */}
        {tab === 'search' && (
          <div className="mt-5 flex flex-col gap-4">
            {!selectedEmployee ? (
              <div>
                <label className="text-sm font-semibold text-slate-700">Search by PagerLook ID, mobile, email or name</label>
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. VW-IEDM-05 or 7740847114"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#005fd6]"
                />
                {searchQuery.trim() && !looksComplete && (
                  <p className="m-0 mt-2 text-xs text-slate-400">
                    Enter the full mobile number, complete PagerLook ID, or email to find the exact person.
                  </p>
                )}
                {looksComplete && searching && <p className="m-0 mt-2 text-xs text-slate-400">Searching…</p>}
                {looksComplete && !searching && results.length === 0 && (
                  <p className="m-0 mt-2 text-xs text-slate-500">
                    No registered employee matches that. Use “Invite by link” to invite someone new.
                  </p>
                )}
                {results.length > 0 && (
                  <ul className="m-0 mt-2 max-h-56 list-none space-y-1 overflow-y-auto p-0">
                    {results.map((emp) => (
                      <li key={emp.employeeId}>
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-left hover:border-[#005fd6] hover:bg-blue-50/40"
                        >
                          <EmployeeInitial name={emp.name} photoUrl={emp.photoUrl} />
                          <div className="min-w-0 flex-1">
                            <p className="m-0 truncate text-sm font-semibold text-slate-900">{emp.name || 'Unnamed'}</p>
                            {(emp.role || emp.company) && (
                              <p className="m-0 truncate text-xs font-medium text-slate-600">
                                {[emp.role, emp.company].filter(Boolean).join(' · ')}
                              </p>
                            )}
                            <p className="m-0 truncate text-xs text-slate-500">
                              {[emp.veriworkId, emp.maskedMobile, emp.maskedEmail].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-[#005fd6]/30 bg-blue-50/50 px-3 py-3">
                <EmployeeInitial name={selectedEmployee.name} photoUrl={selectedEmployee.photoUrl} />
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-sm font-semibold text-slate-900">{selectedEmployee.name}</p>
                  {(selectedEmployee.role || selectedEmployee.company) && (
                    <p className="m-0 truncate text-xs font-medium text-slate-600">
                      {[selectedEmployee.role, selectedEmployee.company].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="m-0 truncate text-xs text-slate-500">
                    {[selectedEmployee.veriworkId, selectedEmployee.maskedMobile, selectedEmployee.maskedEmail].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="shrink-0 text-xs font-semibold text-slate-500 underline"
                >
                  Change
                </button>
              </div>
            )}

            {selectedEmployee && (
              <>
                <Input
                  id="invite-department"
                  label="Department"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={inviteMutation.isPending}
                  error={Boolean(fieldErrors.department)}
                  errorText={fieldErrors.department}
                />
                <Input
                  id="invite-designation"
                  label="Designation"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  disabled={inviteMutation.isPending}
                  error={Boolean(fieldErrors.designation)}
                  errorText={fieldErrors.designation}
                />
                <div className="mt-2 flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={inviteMutation.isPending}>
                    Cancel
                  </Button>
                  <Button type="button" className="flex-1" onClick={handleSendToRegistered} disabled={inviteMutation.isPending || !roleValid}>
                    Send Invitation
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ---- Link (new employee) ---- */}
        {tab === 'link' && (
          <>
            {linkResult?.registrationLink ? (
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="m-0 text-sm font-semibold text-slate-800">
                  Invite link ready{linkResult.emailMock ? ' (dev mode)' : ''}
                </p>
                <p className="m-0 mt-1 text-xs text-slate-500">
                  Share this with {employeeName || 'the employee'}. They register through it and join
                  {department ? ` ${department}` : ' your team'} automatically.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{linkResult.registrationLink}</span>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="shrink-0 rounded-md bg-[#005fd6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0b4fb0]"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setLinkResult(null)
                      setEmployeeName('')
                      setMobile('')
                      setEmail('')
                    }}
                  >
                    Invite another
                  </Button>
                  <Button type="button" className="flex-1" onClick={onClose}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form className="mt-5 flex flex-col gap-4" onSubmit={handleGenerateLink} noValidate>
                <Input
                  id="link-name"
                  label="Employee Name"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  disabled={inviteMutation.isPending}
                  error={Boolean(fieldErrors.employeeName)}
                  errorText={fieldErrors.employeeName}
                />
                <Input
                  id="link-mobile"
                  label="Employee Mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={inviteMutation.isPending}
                  placeholder="10-digit mobile number"
                  error={Boolean(fieldErrors.employeeMobile)}
                  errorText={fieldErrors.employeeMobile}
                />
                <Input
                  id="link-email"
                  label="Employee Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={inviteMutation.isPending}
                  placeholder="Optional — we'll also email the link"
                  hint="Add an email to also send the link to their inbox"
                />
                <Input
                  id="link-department"
                  label="Department"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={inviteMutation.isPending}
                  error={Boolean(fieldErrors.department)}
                  errorText={fieldErrors.department}
                />
                <Input
                  id="link-designation"
                  label="Designation"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  disabled={inviteMutation.isPending}
                  error={Boolean(fieldErrors.designation)}
                  errorText={fieldErrors.designation}
                />
                <div className="mt-2 flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={inviteMutation.isPending}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={inviteMutation.isPending || !roleValid || !employeeName.trim() || !mobile.trim()}
                  >
                    Generate invite link
                  </Button>
                </div>
              </form>
            )}
          </>
        )}

        {inviteMutation.isPending && <Loader variant="overlay" label="Working…" />}
      </div>
    </div>
  )
}

export default InviteEmployeeModal
