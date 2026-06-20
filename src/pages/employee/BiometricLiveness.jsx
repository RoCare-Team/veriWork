import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import CameraCapture from '../../components/employee/CameraCapture'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { ShieldCheckIcon } from '../../components/common/Icons'
import VerificationStepBar, { VerificationBackLink } from '../../components/employee/VerificationStepBar'
import { employeeKeys, verifyBiometric } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'
import { dataUrlToFile } from '../../utils/employeeRoutes'

function BiometricLiveness() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { profile, updateProfileState } = useAuth()
  const firstName = profile?.name?.split(' ')[0] || 'there'
  const [capturedImage, setCapturedImage] = useState(null)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const file = capturedImage ? dataUrlToFile(capturedImage) : null
      return verifyBiometric(file)
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.verification })
      queryClient.invalidateQueries({ queryKey: employeeKeys.profile })
      queryClient.invalidateQueries({ queryKey: employeeKeys.score })
      queryClient.invalidateQueries({ queryKey: employeeKeys.professionalId })
      if (profile) {
        updateProfileState({
          ...profile,
          biometricVerified: true,
          photoUrl: profile.photoUrl || data.photoUrl,
          isVerified: true,
        })
      }
      navigate('/employee/score')
    },
    onError: (err) => setError(err.message || 'Biometric verification failed'),
  })

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
      <VerificationBackLink />
      <VerificationStepBar currentStep="biometric" className="mb-6" />
      <EmployeePageHeader title="Step 3 — Biometric Liveness" subtitle={`Hi ${firstName}, follow the on-screen prompts`} />

      {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <CameraCapture liveness userName={firstName} onCapture={setCapturedImage} />
        <div className="mt-6 space-y-4 lg:mt-0">
          <p className="m-0 text-sm text-slate-600">
            Frame turns <strong className="text-green-600">green</strong> when your face is detected. Move left and right as prompted.
          </p>
          {capturedImage && (
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
              <p className="m-0 text-sm font-semibold text-green-800">{firstName}, face scan complete!</p>
            </div>
          )}
          <Button type="button" disabled={!capturedImage || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Verifying...' : 'Verify & Continue'}
          </Button>
        </div>
      </div>

      {mutation.isPending && <Loader variant="overlay" label="Running liveness check..." />}
    </EmployeeLayout>
  )
}

export default BiometricLiveness
