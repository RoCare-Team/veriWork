import { Link, useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../layouts/OnboardingLayout'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

function ApplicationRejected() {
  const navigate = useNavigate()
  const { company, logout } = useAuth()

  const handleSignOut = async () => {
    await logout()
    navigate('/enterprise/login')
  }

  const name = company?.companyLegalName || company?.name || 'Your application'
  const reason = company?.rejectionReason || company?.rejectionNote

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      title="Application Not Approved"
      subtitle="Your enterprise registration could not be verified at this time."
      backTo="/enterprise/login"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" type="button" fullWidth={false} onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button type="button" fullWidth={false} onClick={() => navigate('/enterprise/verify')}>
            Resubmit Documents
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-8 text-center shadow-sm md:p-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
          ✕
        </div>
        <h2 className="m-0 mt-6 text-xl font-extrabold text-slate-900 md:text-2xl">
          {name} was not approved
        </h2>
        {reason ? (
          <div className="mt-4 w-full max-w-md rounded-2xl border border-red-100 bg-white px-5 py-4 text-left">
            <p className="m-0 text-xs font-bold uppercase tracking-wide text-red-500">Rejection reason</p>
            <p className="m-0 mt-2 text-sm leading-relaxed text-slate-700">{reason}</p>
          </div>
        ) : (
          <p className="m-0 mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            Please update your documents and resubmit, or contact PagerLook support if you believe this was an error.
          </p>
        )}

        <Link
          to="/enterprise/verify"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-[#005fd6] px-7 text-sm font-semibold text-white no-underline shadow-lg shadow-blue-900/20 transition hover:bg-[#004bab]"
        >
          Resubmit Documents
        </Link>
      </div>
    </OnboardingLayout>
  )
}

export default ApplicationRejected
