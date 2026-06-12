/** Indian business entity types and per-type onboarding configuration */

export const COMPANY_TYPE_OPTIONS = [
  { value: 'private_limited', label: 'Private Limited Company (Pvt. Ltd.)' },
  { value: 'public_limited', label: 'Public Limited Company' },
  { value: 'opc', label: 'One Person Company (OPC)' },
  { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
  { value: 'partnership', label: 'Partnership Firm' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'trust_ngo', label: 'Trust / NGO / Society' },
  { value: 'section_8', label: 'Section 8 Company (Non-profit)' },
]

const BASE_DOCS = {
  taxCertificate: {
    id: 'taxCertificate',
    title: 'GST Registration Certificate',
    description: 'Valid GST registration certificate or tax identification proof.',
    required: true,
  },
  addressProof: {
    id: 'addressProof',
    title: 'Proof of Business Address',
    description: 'Utility bill, lease agreement, or bank statement (last 3 months).',
    required: true,
  },
  signatoryId: {
    id: 'signatoryId',
    title: 'Authorized Signatory ID',
    description: 'Government-issued photo ID of the authorized representative.',
    required: true,
  },
  bankLetter: {
    id: 'bankLetter',
    title: 'Company Bank Letter / Cancelled Cheque',
    description: 'Bank letterhead or cancelled cheque in the business name.',
    required: false,
  },
}

export const COMPANY_TYPE_CONFIG = {
  private_limited: {
    label: 'Private Limited Company',
    registration: {
      label: 'Corporate Identification Number (CIN)',
      placeholder: 'e.g. U72900KA2015PTC082988',
      hint: '21-character CIN as per MCA records',
      format: 'cin',
    },
    gstRequired: true,
    documents: [
      {
        id: 'incorporation',
        title: 'Certificate of Incorporation',
        description: 'MCA-issued certificate of incorporation for your company.',
        required: true,
      },
      {
        id: 'registration',
        title: 'MOA & AOA',
        description: 'Memorandum and Articles of Association.',
        required: true,
      },
      BASE_DOCS.taxCertificate,
      BASE_DOCS.addressProof,
      {
        ...BASE_DOCS.signatoryId,
        description: 'Government ID of a director or authorized signatory.',
      },
      BASE_DOCS.bankLetter,
    ],
  },
  public_limited: {
    label: 'Public Limited Company',
    registration: {
      label: 'Corporate Identification Number (CIN)',
      placeholder: 'e.g. L72900KA2015PLC082988',
      hint: '21-character CIN as per MCA records',
      format: 'cin',
    },
    gstRequired: true,
    documents: [
      {
        id: 'incorporation',
        title: 'Certificate of Incorporation',
        description: 'MCA-issued certificate of incorporation.',
        required: true,
      },
      {
        id: 'registration',
        title: 'MOA & AOA',
        description: 'Memorandum and Articles of Association.',
        required: true,
      },
      BASE_DOCS.taxCertificate,
      BASE_DOCS.addressProof,
      {
        ...BASE_DOCS.signatoryId,
        description: 'Government ID of a director or company secretary.',
      },
      BASE_DOCS.bankLetter,
    ],
  },
  opc: {
    label: 'One Person Company',
    registration: {
      label: 'Corporate Identification Number (CIN)',
      placeholder: 'e.g. U72900KA2015OPC082988',
      hint: '21-character CIN for your OPC',
      format: 'cin',
    },
    gstRequired: true,
    documents: [
      {
        id: 'incorporation',
        title: 'Certificate of Incorporation (OPC)',
        description: 'MCA-issued OPC incorporation certificate.',
        required: true,
      },
      {
        id: 'registration',
        title: 'MOA & AOA',
        description: 'Memorandum and Articles of Association.',
        required: true,
      },
      BASE_DOCS.taxCertificate,
      BASE_DOCS.addressProof,
      {
        ...BASE_DOCS.signatoryId,
        description: 'Government ID of the sole director / nominee.',
      },
      BASE_DOCS.bankLetter,
    ],
  },
  llp: {
    label: 'Limited Liability Partnership',
    registration: {
      label: 'LLP Identification Number (LLPIN)',
      placeholder: 'e.g. AAB-1234',
      hint: '7-character LLPIN issued by MCA (e.g. AAA-1234)',
      format: 'llpin',
    },
    gstRequired: true,
    documents: [
      {
        id: 'incorporation',
        title: 'LLP Incorporation Certificate',
        description: 'Certificate of incorporation issued by MCA for the LLP.',
        required: true,
      },
      {
        id: 'registration',
        title: 'LLP Agreement',
        description: 'Signed LLP agreement between all designated partners.',
        required: true,
      },
      BASE_DOCS.taxCertificate,
      BASE_DOCS.addressProof,
      {
        ...BASE_DOCS.signatoryId,
        description: 'Government ID of a designated partner or authorized signatory.',
      },
      BASE_DOCS.bankLetter,
    ],
  },
  partnership: {
    label: 'Partnership Firm',
    registration: {
      label: 'Firm Registration Number',
      placeholder: 'e.g. FIRM/2020/12345 or state registration no.',
      hint: 'State-issued firm registration number (if registered under Indian Partnership Act)',
      format: 'generic',
    },
    gstRequired: true,
    documents: [
      {
        id: 'incorporation',
        title: 'Partnership Deed',
        description: 'Registered or notarized partnership deed signed by all partners.',
        required: true,
      },
      {
        id: 'registration',
        title: 'Firm Registration Certificate',
        description: 'Government-issued firm registration certificate (if registered).',
        required: false,
      },
      BASE_DOCS.taxCertificate,
      BASE_DOCS.addressProof,
      {
        ...BASE_DOCS.signatoryId,
        description: 'Government ID of a partner or authorized signatory.',
      },
      BASE_DOCS.bankLetter,
    ],
  },
  sole_proprietorship: {
    label: 'Sole Proprietorship',
    registration: {
      label: 'Udyam / Business Registration Number',
      placeholder: 'e.g. UDYAM-MH-00-0001234',
      hint: 'Udyam registration or Shop & Establishment licence number',
      format: 'udyam',
    },
    gstRequired: true,
    documents: [
      {
        id: 'incorporation',
        title: 'Udyam Registration Certificate',
        description: 'Udyam MSME registration certificate (or Shop & Establishment licence).',
        required: false,
      },
      {
        id: 'registration',
        title: 'Business Licence / Shop Act Registration',
        description: 'Local business licence or Shop & Establishment registration.',
        required: true,
      },
      BASE_DOCS.taxCertificate,
      BASE_DOCS.addressProof,
      {
        ...BASE_DOCS.signatoryId,
        description: 'Government ID of the sole proprietor (PAN / Aadhaar).',
      },
      BASE_DOCS.bankLetter,
    ],
  },
  trust_ngo: {
    label: 'Trust / NGO / Society',
    registration: {
      label: 'Trust / Society Registration Number',
      placeholder: 'e.g. TR/1234/2018 or state society registration no.',
      hint: 'Registration number from the Charity Commissioner or Registrar of Societies',
      format: 'generic',
    },
    gstRequired: false,
    documents: [
      {
        id: 'incorporation',
        title: 'Trust Deed / Society Registration Certificate',
        description: 'Registered trust deed or society incorporation certificate.',
        required: true,
      },
      {
        id: 'registration',
        title: '12A / 80G Certificate (if applicable)',
        description: 'Income Tax exemption certificates, if obtained.',
        required: false,
      },
      {
        id: 'taxCertificate',
        title: 'PAN / GST Certificate',
        description: 'PAN allotment letter or GST registration (if applicable).',
        required: true,
      },
      BASE_DOCS.addressProof,
      {
        ...BASE_DOCS.signatoryId,
        description: 'Government ID of trustee, secretary, or authorized signatory.',
      },
      BASE_DOCS.bankLetter,
    ],
  },
  section_8: {
    label: 'Section 8 Company',
    registration: {
      label: 'Corporate Identification Number (CIN)',
      placeholder: 'e.g. U72900KA2015NPL082988',
      hint: '21-character CIN for your Section 8 company',
      format: 'cin',
    },
    gstRequired: false,
    documents: [
      {
        id: 'incorporation',
        title: 'Certificate of Incorporation',
        description: 'MCA-issued Section 8 company incorporation certificate.',
        required: true,
      },
      {
        id: 'registration',
        title: 'License under Section 8',
        description: 'Central Government licence issued under Section 8 of Companies Act.',
        required: true,
      },
      {
        id: 'taxCertificate',
        title: 'PAN / GST Certificate',
        description: 'PAN allotment or GST registration (if applicable).',
        required: false,
      },
      BASE_DOCS.addressProof,
      {
        ...BASE_DOCS.signatoryId,
        description: 'Government ID of a director or authorized signatory.',
      },
      BASE_DOCS.bankLetter,
    ],
  },
}

const DEFAULT_TYPE = 'private_limited'

export function getCompanyTypeConfig(companyType) {
  return COMPANY_TYPE_CONFIG[companyType] || COMPANY_TYPE_CONFIG[DEFAULT_TYPE]
}

export function getCompanyTypeLabel(companyType) {
  const option = COMPANY_TYPE_OPTIONS.find((o) => o.value === companyType)
  return option?.label || getCompanyTypeConfig(companyType).label
}

export function getDocumentsForCompanyType(companyType) {
  return getCompanyTypeConfig(companyType).documents
}

export function resolveCompanyType(company, basicInfo) {
  return basicInfo?.companyType || company?.companyType || DEFAULT_TYPE
}
