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

export const INDUSTRY_OPTIONS = [
  'Technology & IT',
  'Healthcare',
  'Finance & Banking',
  'Manufacturing',
  'Retail & E-commerce',
  'Education',
  'Consulting',
  'Other',
]

export const COMPANY_SIZE_OPTIONS = [
  '1–50 employees',
  '51–200 employees',
  '201–500 employees',
  '501–1000 employees',
  '1000+ employees',
]
