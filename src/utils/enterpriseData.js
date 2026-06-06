export const EMPLOYEES = [
  {
    id: '1',
    initials: 'AR',
    name: 'Arjun Raghav',
    role: 'Senior Engineer',
    department: 'Engineering',
    trustScore: 50,
    verified: true,
  },
  {
    id: '2',
    initials: 'SM',
    name: 'Sarah Miller',
    role: 'Product Designer',
    department: 'Design',
    trustScore: 92,
    verified: true,
  },
  {
    id: '3',
    initials: 'DK',
    name: 'Deepak Kumar',
    role: 'HR Manager',
    department: 'Human Resources',
    trustScore: 88,
    verified: true,
  },
  {
    id: '4',
    initials: 'NJ',
    name: 'Neha Joshi',
    role: 'Data Analyst',
    department: 'Analytics',
    trustScore: 76,
    verified: false,
  },
]

export const JOIN_REQUESTS = [
  {
    id: '1',
    name: 'Arjun Mehta',
    role: 'Sr. Product Designer',
    department: 'Design',
    trust: 94,
    joiningDate: 'Oct 24, 2023',
    salaryBand: '₹24L - ₹28L',
    documents: ['ID_Proof.pdf', 'Exp_Letter.pdf'],
    avatar: 'AM',
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    role: 'Frontend Developer',
    department: 'Engineering',
    trust: 91,
    joiningDate: 'Nov 02, 2023',
    salaryBand: '₹18L - ₹22L',
    documents: ['ID_Proof.pdf', 'Offer_Letter.pdf'],
    avatar: 'SJ',
  },
  {
    id: '3',
    name: 'Rahul Verma',
    role: 'Business Analyst',
    department: 'Operations',
    trust: 87,
    joiningDate: 'Nov 15, 2023',
    salaryBand: '₹14L - ₹18L',
    documents: ['ID_Proof.pdf', 'Exp_Letter.pdf'],
    avatar: 'RV',
  },
  {
    id: '4',
    name: 'Priya Nair',
    role: 'UX Researcher',
    department: 'Design',
    trust: 96,
    joiningDate: 'Dec 01, 2023',
    salaryBand: '₹20L - ₹24L',
    documents: ['ID_Proof.pdf', 'Portfolio.pdf'],
    avatar: 'PN',
  },
]

export const QR_RECENT = [
  { id: '1', title: 'Engineering Batch Q4', meta: 'Generated 2h ago • 12 scans' },
  { id: '2', title: 'Sales Internship QR', meta: 'Generated 1d ago • 48 scans' },
  { id: '3', title: 'Design Hiring Drive', meta: 'Generated 3d ago • 7 scans' },
]

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Sales',
  'Human Resources',
  'Operations',
]
