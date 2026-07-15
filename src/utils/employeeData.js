import { buildPublicProfileUrl } from '../lib/publicProfileUrl'

export const EMPLOYEE_PROFILE = {
  name: 'Arjun Raghav',
  initials: 'AR',
  role: 'Senior Product Designer',
  company: 'PagerLook Tech',
  experience: '8+ Years Exp',
  trustScore: 98,
  verifiedJobs: 12,
  endorsements: 24,
  veriworkId: 'VW-8829-XQ',
  publicProfileUrl: buildPublicProfileUrl({ publicSlug: 'user_882900', veriworkId: 'VW-8829-XQ' }),
  skills: ['UI/UX Design', 'Fintech', 'System Architecture', 'Product Strategy'],
}

export const JOB_HISTORY = [
  {
    id: 1,
    title: 'Senior Product Designer',
    company: 'TechFlow Systems',
    duration: '2021 - Present',
    type: 'Full-time',
    status: 'verified',
  },
  {
    id: 2,
    title: 'Product Designer',
    company: 'Innovate Labs',
    duration: '2019 - 2021',
    type: 'Full-time',
    status: 'in_process',
  },
  {
    id: 3,
    title: 'Junior Designer',
    company: 'Startup Hub',
    duration: '2018 - 2019',
    type: 'Full-time',
    status: 'not_verified',
  },
  {
    id: 4,
    title: 'Design Intern',
    company: 'Pixel Perfect Co.',
    duration: '2017 - 2018',
    type: 'Internship',
    status: 'not_verified',
  },
]

export const JOB_HISTORY_SUMMARY = {
  totalYears: '6 Years Total',
  verifiedCount: 3,
  totalCount: 5,
}
