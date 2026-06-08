export const EMPLOYEES = [
  {
    id: '1',
    initials: 'AR',
    name: 'Arjun Raghav',
    role: 'Senior Engineer',
    department: 'Engineering',
    employeeScore: 842,
    verified: true,
  },
  {
    id: '2',
    initials: 'SM',
    name: 'Sarah Miller',
    role: 'Product Designer',
    department: 'Design',
    employeeScore: 798,
    verified: true,
  },
  {
    id: '3',
    initials: 'DK',
    name: 'Deepak Kumar',
    role: 'HR Manager',
    department: 'Human Resources',
    employeeScore: 765,
    verified: true,
  },
  {
    id: '4',
    initials: 'NJ',
    name: 'Neha Joshi',
    role: 'Data Analyst',
    department: 'Analytics',
    employeeScore: 612,
    verified: false,
  },
]

export const JOIN_REQUESTS = [
  {
    id: '1',
    name: 'Arjun Mehta',
    role: 'Sr. Product Designer',
    department: 'Design',
    employeeScore: 824,
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
    employeeScore: 791,
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
    employeeScore: 718,
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
    employeeScore: 856,
    joiningDate: 'Dec 01, 2023',
    salaryBand: '₹20L - ₹24L',
    documents: ['ID_Proof.pdf', 'Portfolio.pdf'],
    avatar: 'PN',
  },
]

export const DASHBOARD_STATS = [
  { label: 'Total Employees', value: '1,284', change: '+12%' },
  { label: 'Pending Verifications', value: '38', change: '-5%' },
  { label: 'Avg VeriScore', value: '782', change: '+3%' },
  { label: 'Join Requests', value: '14', change: '+8%' },
]

export const DEPARTMENTS = [
  { value: '', label: 'All Departments' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'operations', label: 'Operations' },
]

export const QR_RECENT = [
  { id: '1', label: 'Engineering Batch — Oct 2023', scans: 142, joined: 38 },
  { id: '2', label: 'Design Hiring Drive', scans: 89, joined: 21 },
  { id: '3', label: 'Campus Recruitment QR', scans: 256, joined: 64 },
]
