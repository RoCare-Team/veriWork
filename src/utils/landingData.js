export const LANDING_NAV = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'Portals', href: '#portals' },
]

export const LANDING_STATS = [
  { value: '2M+', label: 'Verifications processed' },
  { value: '98%', label: 'Fraud detection accuracy' },
  { value: '500+', label: 'Enterprise teams' },
  { value: '< 2 min', label: 'Avg. identity check' },
]

export const LANDING_FEATURES = [
  {
    id: 'identity',
    title: 'Verified Identity',
    description:
      'Aadhaar, DigiLocker, and biometric liveness checks create a tamper-proof professional identity.',
    icon: 'shield',
    accent: 'bg-blue-50 text-[#1a3a8f]',
  },
  {
    id: 'workforce',
    title: 'Workforce Dashboard',
    description:
      'Monitor verification status, join requests, and trust scores across your entire organization.',
    icon: 'grid',
    accent: 'bg-orange-50 text-[#ea7a3b]',
  },
  {
    id: 'job-history',
    title: 'Trusted Job History',
    description:
      'Employees build verified employment records that employers can validate in seconds, not weeks.',
    icon: 'briefcase',
    accent: 'bg-emerald-50 text-emerald-700',
  },
  {
    id: 'vault',
    title: 'Document Vault',
    description:
      'Encrypted storage for offer letters, experience certificates, and compliance documents.',
    icon: 'vault',
    accent: 'bg-violet-50 text-violet-700',
  },
  {
    id: 'qr',
    title: 'QR Onboarding',
    description:
      'Onboard field teams instantly with secure QR codes and real-time verification workflows.',
    icon: 'qr',
    accent: 'bg-sky-50 text-sky-700',
  },
  {
    id: 'activity',
    title: 'Activity & Consent',
    description:
      'Every data access request is logged. Employees approve or deny before anything is shared.',
    icon: 'activity',
    accent: 'bg-rose-50 text-rose-700',
  },
]

export const LANDING_STEPS = [
  {
    step: '01',
    title: 'Register or sign in',
    description: 'Employers onboard their company; professionals create a secure profile.',
    for: 'both',
  },
  {
    step: '02',
    title: 'Verify identity',
    description: 'DigiLocker Aadhaar and biometric checks establish trust at the source.',
    for: 'employee',
  },
  {
    step: '03',
    title: 'Build professional ID',
    description: 'A cryptographically signed digital ID card and shareable profile link.',
    for: 'employee',
  },
  {
    step: '04',
    title: 'Manage workforce',
    description: 'Review join requests, verify candidates, and monitor compliance from one hub.',
    for: 'enterprise',
  },
]

export const LANDING_PORTALS = [
  {
    to: '/enterprise/login',
    title: 'Employer Portal',
    badge: 'For Companies',
    description:
      'Verify candidates, manage join requests, and onboard employees with enterprise-grade compliance.',
    cta: 'Access Employer Portal',
    secondaryTo: '/enterprise/register',
    secondaryCta: 'Register company',
    gradient: 'from-[#152b6e] via-[#1a3a8f] to-[#2747b2]',
    highlights: ['Workforce dashboard', 'Join request workflow', 'QR onboarding', 'Fraud alerts'],
  },
  {
    to: '/employee',
    title: 'Employee Portal',
    badge: 'For Professionals',
    description:
      'Create your verified identity, manage job history, and control who accesses your data.',
    cta: 'Access Employee Portal',
    secondaryTo: '/employee/login',
    secondaryCta: 'Sign in with OTP',
    gradient: 'from-[#1a3a8f] via-[#2747b2] to-[#3b5ccc]',
    highlights: ['Aadhaar verification', 'Professional ID card', 'Document vault', 'Activity log'],
  },
]

export const LANDING_SECURITY = [
  { label: 'ISO 27001', detail: 'Certified security framework' },
  { label: '256-bit SSL', detail: 'End-to-end encryption' },
  { label: 'DigiLocker', detail: 'Government-backed identity' },
  { label: 'GDPR-ready', detail: 'Privacy by design' },
]

export const LANDING_TESTIMONIALS = [
  {
    quote:
      'VeriWork cut our background verification time from two weeks to under a day. The trust score is a game changer.',
    name: 'Priya Sharma',
    role: 'HR Director, TechFlow Systems',
    initials: 'PS',
  },
  {
    quote:
      'My Professional ID travels with me. Every employer sees verified credentials without me re-uploading documents.',
    name: 'Arjun Raghav',
    role: 'Senior Product Designer',
    initials: 'AR',
  },
]

export const LANDING_FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Security', href: '#security' },
    { label: 'Employer Portal', to: '/enterprise/login' },
    { label: 'Employee Portal', to: '/employee' },
    { label: 'Admin Console', to: '/admin/login' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Compliance', href: '#' },
  ],
}
