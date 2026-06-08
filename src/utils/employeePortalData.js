export const VAULT_STORAGE = {
  used: '1.2 GB',
  total: '5 GB',
  percent: 24,
}

export const VAULT_CATEGORIES = [
  { id: 'identity', label: 'Identity', files: 4, color: 'blue', icon: 'id' },
  { id: 'education', label: 'Education', files: 6, color: 'purple', icon: 'education' },
  { id: 'experience', label: 'Experience', files: 12, color: 'green', icon: 'briefcase', to: '/employee/job-history' },
  { id: 'financial', label: 'Financial', files: 8, color: 'orange', icon: 'wallet' },
]

export const RECENT_DOCUMENTS = [
  { id: 1, name: 'Aadhaar_Card_Verified.pdf', size: '1.2 MB', date: 'Oct 12, 2023', status: 'verified' },
  { id: 2, name: 'payslip_sept.pdf', size: '840 KB', date: 'Sep 28, 2023', status: 'verified' },
  { id: 3, name: 'degree_certificate.pdf', size: '2.1 MB', date: 'Aug 15, 2023', status: 'verified' },
]

export const PENDING_REQUESTS = [
  {
    id: 1,
    company: 'Google Inc.',
    time: '2m ago',
    message: 'Recruiter Sarah Chen requested access to your Document Vault for Senior Engineer role.',
  },
  {
    id: 2,
    company: 'Stripe',
    time: '1h ago',
    message: 'HR team requested verification of your employment at TechFlow Systems.',
  },
]

export const ACTIVITY_UPDATES = [
  {
    id: 1,
    title: 'Identity Verified',
    time: '3h ago',
    message: 'Your Aadhaar verification was successful. Your Trust Score increased by 15%!',
  },
  {
    id: 2,
    title: 'Job Submitted',
    time: '1d ago',
    message: 'Your experience at Innovate Labs is under employer review.',
  },
]

export const ACTIVE_SESSIONS = [
  { id: 1, device: 'iPhone 15 Pro', location: 'Mumbai, India', status: 'Online', current: true },
  { id: 2, device: 'MacBook Pro', location: 'Mumbai, India', status: '2h ago', current: false },
]
