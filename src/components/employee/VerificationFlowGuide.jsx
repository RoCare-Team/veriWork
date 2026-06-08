import { getCurrentVerificationStep } from '../../store/employeeStore'

const GUIDE = {
  profile: {
    title: 'Start with your basic details',
    body: 'Add your name and role first. This creates your unique VeriWork profile — separate from every other user on the platform.',
  },
  aadhaar: {
    title: 'Next: verify your Aadhaar',
    body: 'DigiLocker is the fastest way. We fetch your e-KYC document securely — your Aadhaar number is never stored in plain text.',
  },
  biometric: {
    title: 'Final step: face match',
    body: 'Take a quick selfie. We match it with your ID photo to confirm you are the real account holder.',
  },
  complete: {
    title: 'You are fully verified!',
    body: 'Your Professional ID, Trust Score, and job history features are now unlocked.',
  },
}

function VerificationFlowGuide() {
  const step = getCurrentVerificationStep()
  const content = GUIDE[step] || GUIDE.profile

  return (
    <div className="rounded-2xl border border-[#1a3a8f]/15 bg-gradient-to-br from-blue-50/80 to-white p-5 md:p-6">
      <p className="m-0 text-xs font-bold uppercase tracking-widest text-[#ea7a3b]">
        What happens next
      </p>
      <h3 className="m-0 mt-2 text-base font-extrabold text-[#1a3a8f] md:text-lg">{content.title}</h3>
      <p className="m-0 mt-2 text-sm leading-relaxed text-slate-600">{content.body}</p>
    </div>
  )
}

export default VerificationFlowGuide
