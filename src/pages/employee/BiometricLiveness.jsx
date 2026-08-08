import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import CameraCapture from '../../components/employee/CameraCapture'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { ShieldCheckIcon, InfoIcon } from '../../components/common/Icons'
import VerificationStepBar, { VerificationBackLink } from '../../components/employee/VerificationStepBar'
import { employeeKeys, fetchAadhaarSubmission, verifyBiometric } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'
import { getCompletedJourneySteps } from '../../utils/employeeJourney'
import { dataUrlToFile } from '../../utils/employeeRoutes'

function BiometricLiveness() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { profile, updateProfileState } = useAuth()
  const journeyCompleted = getCompletedJourneySteps(profile)
  const firstName = profile?.name?.split(' ')[0] || 'there'

  const [frames, setFrames] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const { data: aadhaar, isLoading } = useQuery({
    queryKey: employeeKeys.aadhaarSubmission,
    queryFn: fetchAadhaarSubmission,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const selfie = dataUrlToFile(frames.center, 'selfie.jpg')
      const poses = (frames.poses || []).map((frame, i) => dataUrlToFile(frame, `pose-${i}.jpg`))
      return verifyBiometric(selfie, poses)
    },
    onSuccess: (data) => {
      setError('')
      setResult(data)
      queryClient.invalidateQueries({ queryKey: employeeKeys.verification })
      queryClient.invalidateQueries({ queryKey: employeeKeys.profile })
      queryClient.invalidateQueries({ queryKey: employeeKeys.score })
      queryClient.invalidateQueries({ queryKey: employeeKeys.professionalId })
      queryClient.invalidateQueries({ queryKey: employeeKeys.aadhaarSubmission })
      if (profile) {
        updateProfileState({
          ...profile,
          biometricVerified: true,
          photoUrl: profile.photoUrl || data.photoUrl,
          isVerified: true,
        })
      }
    },
    onError: (err) => {
      setError(err.message || 'Face match failed')
      // Force a fresh scan — reusing the frames that just failed will fail again.
      setFrames(null)
    },
  })

  if (isLoading) {
    return (
      <EmployeeLayout>
        <Loader variant="fullPage" label="Checking your Aadhaar status..." />
      </EmployeeLayout>
    )
  }

  const aadhaarApproved = aadhaar?.status === 'approved'

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
      <VerificationBackLink />
      <VerificationStepBar currentStep="identity" completed={journeyCompleted} className="mb-6" />
      <EmployeePageHeader
        title="Face match"
        subtitle={`Identity check 2 of 2 — hi ${firstName}, we match your live selfie against the photo on your Aadhaar card`}
      />

      {!aadhaarApproved ? (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="m-0 text-sm font-bold text-amber-900">Aadhaar approval needed first</p>
            <p className="m-0 mt-1 text-sm text-amber-800">
              {aadhaar?.status === 'pending'
                ? 'Your Aadhaar is still with our verification team. The face match unlocks as soon as it is approved.'
                : 'Submit your Aadhaar card and get it approved before running the face match.'}
            </p>
            <Link
              to="/employee/verification/aadhaar"
              className="mt-3 inline-block text-sm font-semibold text-[#1e3a8a] hover:underline"
            >
              Go to Aadhaar verification →
            </Link>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-5">
          <div className="flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
            <ShieldCheckIcon className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
            <div>
              <p className="m-0 text-base font-bold text-green-900">Face matched</p>
              <p className="m-0 mt-1 text-sm text-green-800">
                Your live selfie matched the photo on your Aadhaar card at{' '}
                <strong>{result.similarity}%</strong> similarity (
                {result.threshold}% required)
                {result.livenessPassed ? ' and the liveness check passed.' : '.'}
              </p>
            </div>
          </div>
          <Button type="button" onClick={() => navigate('/employee/score')}>
            See your score
          </Button>
        </div>
      ) : (
        <>
          {error && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <CameraCapture liveness userName={firstName} onCapture={setFrames} />
            <div className="mt-6 space-y-4 lg:mt-0">
              <p className="m-0 text-sm text-slate-600">
                Follow the three prompts — look straight ahead, then turn left, then right. The frame
                turns <strong className="text-green-600">green</strong> each time we capture.
              </p>
              <p className="m-0 text-sm text-slate-500">
                Attempts used: {aadhaar?.faceMatch?.attempts ?? 0}
              </p>
              {frames?.center && (
                <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  <p className="m-0 text-sm font-semibold text-green-800">
                    {firstName}, face scan complete — {(frames.poses?.length ?? 0) + 1} frames captured.
                  </p>
                </div>
              )}
              <Button
                type="button"
                disabled={!frames?.center || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? 'Matching...' : 'Run face match'}
              </Button>
            </div>
          </div>
        </>
      )}

      {mutation.isPending && <Loader variant="overlay" label="Matching your face against your Aadhaar photo..." />}
    </EmployeeLayout>
  )
}

export default BiometricLiveness
