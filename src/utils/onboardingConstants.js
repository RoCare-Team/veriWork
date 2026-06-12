export const ONBOARDING_STEPS = [
  'Business Basic Info',
  'Documents Verification',
  'Review Final Check',
]

export const COMPANY_DOCUMENTS = [
  {
    id: 'incorporation',
    title: 'Business Incorporation Certificate',
    description: 'Official certificate of incorporation or company registration.',
    required: true,
  },
  {
    id: 'registration',
    title: 'Business Registration Certificate',
    description: 'Government-issued business registration document.',
    required: true,
  },
  {
    id: 'taxCertificate',
    title: 'Tax ID / GST Registration Certificate',
    description: 'Valid tax identification or GST registration proof.',
    required: true,
  },
  {
    id: 'addressProof',
    title: 'Proof of Business Address',
    description: 'Utility bill, lease agreement, or bank statement (last 3 months).',
    required: true,
  },
  {
    id: 'signatoryId',
    title: 'Authorized Signatory ID',
    description: 'Government ID of director, HR head, or authorized representative.',
    required: true,
  },
  {
    id: 'bankLetter',
    title: 'Company Bank Letter / Cancelled Cheque',
    description: 'Bank letterhead or cancelled cheque in company name.',
    required: false,
  },
]

/** API values for POST /auth/enterprise/register */
export const INDUSTRY_OPTIONS = [
  { value: 'Technology', label: 'Technology & IT' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Finance', label: 'Finance & Banking' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail', label: 'Retail & E-commerce' },
  { value: 'Education', label: 'Education' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Other', label: 'Other' },
]

export const COMPANY_SIZE_OPTIONS = [
  { value: '1-50', label: '1–50 employees' },
  { value: '50-200', label: '51–200 employees' },
  { value: '200-500', label: '201–500 employees' },
  { value: '500-1000', label: '501–1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]
