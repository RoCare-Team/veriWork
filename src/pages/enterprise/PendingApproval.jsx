import { Link, useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../layouts/OnboardingLayout'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

function PendingApproval() {
  const navigate = useNavigate()
  const { company, logout } = useAuth()

  const handleSignOut = async () => {
    await logout()
    navigate('/enterprise/login')
  }

  const name = company?.companyLegalName || company?.name || 'Your company'

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      title="Application Under Review"
      subtitle="Your enterprise registration has been submitted to our compliance team."
      backTo="/enterprise/login"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" type="button" fullWidth={false} onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button type="button" fullWidth={false} disabled>
            Awaiting Admin Approval
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-8 text-center shadow-sm md:p-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-3xl">
          ⏳
        </div>
        <h2 className="m-0 mt-6 text-xl font-extrabold text-slate-900 md:text-2xl">
          {name}
        </h2>
        <p className="m-0 mt-3 max-w-md text-sm leading-relaxed text-slate-600 md:text-base">
          Your application is under review. Our team will review your documents within 24–48 business hours.
          You will receive an email once your employer dashboard is unlocked.
        </p>

        <ul className="mt-8 w-full max-w-md space-y-3 text-left text-sm text-slate-600">
          <li className="flex gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <span className="text-green-600">✓</span> Registration submitted
          </li>
          <li className="flex gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <span className="text-amber-500">●</span> Admin compliance review (24–48 hrs)
          </li>
          <li className="flex gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-slate-400">
            <span>○</span> Dashboard access unlocked
          </li>
        </ul>

        <p className="m-0 mt-8 text-xs text-slate-400">
          Questions?{' '}
          <a href="mailto:support@veriwork.com" className="font-semibold text-[#1a3a8f] hover:underline">
            support@veriwork.com
          </a>
          {' · '}
          <Link to="/" className="font-semibold text-[#1a3a8f] hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </OnboardingLayout>
  )
}

export default PendingApproval
