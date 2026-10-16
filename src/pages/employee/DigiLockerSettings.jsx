import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import DigiLockerButton from '../../components/employee/DigiLockerButton'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import {
  employeeKeys,
  fetchDigiLockerConnection,
  startDigiLockerConnect,
  disconnectDigiLocker,
} from '../../api/employee'
import { useToast } from '../../context/ToastContext'

// Landing page for the DigiLocker OAuth round-trip. The backend callback
// (/api/digilocker/callback) redirects here with ?status=success|failed&message=…
function DigiLockerSettings() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [result] = useState(() => ({
    status: searchParams.get('status'),
    message: searchParams.get('message'),
  }))

  // Drop the one-shot result params so a refresh doesn't replay the banner.
  useEffect(() => {
    if (searchParams.has('status') || searchParams.has('message')) {
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const { data: connection, isLoading } = useQuery({
    queryKey: employeeKeys.digilocker,
    queryFn: fetchDigiLockerConnection,
  })

  const connect = useMutation({
    mutationFn: startDigiLockerConnect,
    onSuccess: (data) => {
      window.location.assign(data.authorizationUrl)
    },
    onError: (err) => toast(err.message || 'Could not start DigiLocker', 'error'),
  })

  const disconnect = useMutation({
    mutationFn: disconnectDigiLocker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.digilocker })
      toast('DigiLocker disconnected', 'success')
    },
    onError: (err) => toast(err.message || 'Could not disconnect DigiLocker', 'error'),
  })

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="DigiLocker"
        subtitle="Link your DigiLocker account to share government-issued documents"
        action={
          <Link to="/employee/settings" className="text-sm font-semibold text-[#1e3a8a] no-underline">
            ← Back
          </Link>
        }
      />

      <div className="space-y-6">
        {result.status === 'success' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            DigiLocker connected successfully.
          </div>
        )}
        {result.status === 'failed' && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {result.message || 'DigiLocker authentication failed'}. Please try again.
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          {isLoading ? (
            <Loader />
          ) : connection?.connected ? (
            <div className="space-y-4">
              <p className="m-0 text-sm text-slate-700">
                <span className="font-semibold text-emerald-700">Connected</span>
                {connection.connectedAt && ` since ${new Date(connection.connectedAt).toLocaleDateString()}`}
              </p>
              <Button
                type="button"
                variant="secondary"
                fullWidth={false}
                disabled={disconnect.isPending}
                onClick={() => disconnect.mutate()}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="m-0 text-sm text-slate-600">
                You'll be taken to DigiLocker to sign in and give consent, then brought back here.
              </p>
              <DigiLockerButton loading={connect.isPending} onClick={() => connect.mutate()} />
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default DigiLockerSettings
