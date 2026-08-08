import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import SettingsRow from '../../components/employee/SettingsRow'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import {
  CallIcon,
  DocumentIcon,
  InfoIcon,
  InstagramIcon,
  MailIcon,
  WhatsAppIcon,
} from '../../components/common/Icons'
import {
  CONTACT_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  mailtoLink,
  whatsappLink,
} from '../../utils/contactInfo'

const CONTACT_CHANNELS = [
  {
    label: 'WhatsApp',
    hint: SUPPORT_PHONE_DISPLAY,
    href: whatsappLink('Hi PagerLook support, I need help with my verification.'),
    Icon: WhatsAppIcon,
    external: true,
    accent: 'text-[#25D366]',
  },
  {
    label: 'Call us',
    hint: SUPPORT_PHONE_DISPLAY,
    href: CONTACT_LINKS.call,
    Icon: CallIcon,
    accent: 'text-[#1e3a8a]',
  },
  {
    label: 'Email',
    hint: SUPPORT_EMAIL,
    href: mailtoLink('PagerLook support request'),
    Icon: MailIcon,
    accent: 'text-[#1e3a8a]',
  },
  {
    label: 'Instagram',
    hint: '@pagerlook',
    href: CONTACT_LINKS.instagram,
    Icon: InstagramIcon,
    external: true,
    accent: 'text-[#E1306C]',
  },
]

function PhoneIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="5.5" y="2.5" width="9" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function Support() {
  const [issue, setIssue] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!issue.trim()) return
    setSubmitted(true)
  }

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Support & Resources" subtitle="Get help with verification and account issues" />

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:max-w-lg">
        {CONTACT_CHANNELS.map(({ label, hint, href, Icon, external, accent }) => (
          <a
            key={label}
            href={href}
            {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 text-center no-underline shadow-sm transition hover:border-slate-200 hover:shadow-md"
          >
            <Icon className={`h-8 w-8 ${accent}`} />
            <span className="mt-2 text-sm font-semibold text-slate-800">{label}</span>
            <span className="mt-0.5 break-all text-xs text-slate-400">{hint}</span>
          </a>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <SettingsRow icon={<DocumentIcon className="h-5 w-5" />} title="Terms of Service" subtitle="Legal agreements" />
        <SettingsRow icon={<InfoIcon className="h-5 w-5" />} title="App Version" subtitle="v2.4.0-stable" />
      </div>

      <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 md:p-6">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-[#1e3a8a]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="m-0 text-sm font-bold text-[#1e3a8a] md:text-base">Open a Support Ticket</p>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Have an issue with your verification? Our team typically responds within 2 hours.
        </p>

        {submitted ? (
          <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-800">
            Ticket created! We&apos;ll get back to you soon.
          </p>
        ) : (
          <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              id="issue"
              label="Describe your issue"
              placeholder="e.g. Job verification pending..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              leftIcon={<PhoneIcon />}
            />
            <Button type="submit" disabled={!issue.trim()}>
              Create Ticket
            </Button>
          </form>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <Link to="/employee/login" className="text-sm font-semibold text-[#1e3a8a] no-underline hover:underline">
          Logout Session
        </Link>
        <button type="button" className="text-xs text-slate-400 underline hover:text-slate-600">
          Delete Account
        </button>
      </div>

      <Link
        to="/employee/settings"
        className="mt-6 inline-block text-sm font-semibold text-[#1e3a8a] no-underline hover:underline"
      >
        ← Back to Settings
      </Link>
    </EmployeeLayout>
  )
}

export default Support
