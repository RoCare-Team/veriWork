import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import { TeamMemberRow, SettingsMenuRow } from '../../components/enterprise/SettingsComponents'
import { SECURITY_MENU } from '../../utils/settingsData'
import { useAuth } from '../../context/AuthContext'
import { enterpriseKeys, fetchWorkspace } from '../../api/enterprise'
import { getInitials } from '../../utils/formatters'
import Loader from '../../components/common/Loader'
import SmtpSettingsSection from '../../components/enterprise/SmtpSettingsSection'

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'team', label: 'Team' },
  { id: 'security', label: 'Security' },
]

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3a5 5 0 0 1 5 5v3l1.5 2.5H3.5L5 11V8a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 16a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function TeamMembersSection({ admin, companyName }) {
  if (!admin) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <h3 className="m-0 text-base font-bold text-slate-900">Team Members</h3>
        <p className="mt-3 text-sm text-slate-500">No admin account linked.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      <h3 className="m-0 text-base font-bold text-slate-900">Team Members</h3>
      <p className="m-0 mt-1 text-xs text-slate-500">Portal admins for {companyName || 'your workspace'}</p>
      <div className="mt-4">
        <TeamMemberRow
          initials={getInitials(admin.name)}
          name={admin.name}
          role={admin.email}
          badge="Admin"
          badgeColor="blue"
          avatarBg="bg-[#005fd6]"
        />
      </div>
    </section>
  )
}

function SecurityApiSection() {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white px-5 shadow-sm md:px-6">
      <h3 className="mb-1 pt-5 text-base font-bold text-slate-900">Security & API</h3>
      {SECURITY_MENU.map((item) => (
        <SettingsMenuRow key={item.id} {...item} />
      ))}
    </section>
  )
}

function EnterprisePlanCard({ totalEmployees }) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#005fd6] to-[#0073fe] p-5 text-white shadow-lg md:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="m-0 text-lg font-extrabold">Enterprise Plan</h3>
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#005fd6]">
          Active
        </span>
      </div>
      <p className="mt-1 text-sm text-white/70">Workforce linked to your company</p>
      <div className="my-5 border-t border-white/20" />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="m-0 text-3xl font-extrabold">{totalEmployees ?? 0}</p>
          <p className="mt-1 text-sm text-white/70">Linked Employees</p>
        </div>
      </div>
    </section>
  )
}

function DangerZoneSection() {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold text-red-500">Danger Zone</h3>
      <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="m-0 text-sm font-bold text-slate-900">Deactivate Workspace</p>
            <p className="mt-1 text-xs text-slate-500">
              Permanently delete all company data and employee records.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </section>
  )
}

function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const { company: authCompany } = useAuth()

  const { data: workspace, isLoading } = useQuery({
    queryKey: enterpriseKeys.workspace,
    queryFn: fetchWorkspace,
  })

  const company = workspace || authCompany

  if (isLoading && !company) {
    return <Loader variant="fullPage" label="Loading settings..." />
  }

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 pb-10 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          title="Settings & Team"
          subtitle={company?.name ? `${company.name} · Manage workspace and permissions` : 'Manage workspace and permissions'}
          action={
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label="Notifications"
            >
              <BellIcon />
            </button>
          }
        />

        <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          {activeTab === 'general' && (
            <>
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                <h3 className="m-0 text-base font-bold text-slate-900">Workspace</h3>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Company Name</label>
                    <input
                      type="text"
                      readOnly
                      value={company?.name || ''}
                      placeholder="Your company name"
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Industry</label>
                      <input
                        type="text"
                        readOnly
                        value={company?.industry || '—'}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Company Size</label>
                      <input
                        type="text"
                        readOnly
                        value={company?.companySize || '—'}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Work Email</label>
                    <input
                      type="text"
                      readOnly
                      value={company?.workEmail || ''}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">City</label>
                      <input
                        type="text"
                        readOnly
                        value={company?.city || '—'}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Country</label>
                      <input
                        type="text"
                        readOnly
                        value={company?.country || '—'}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Contact Person</label>
                    <input
                      type="text"
                      readOnly
                      value={company?.contactName || '—'}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </section>
              <SmtpSettingsSection />
              <TeamMembersSection admin={workspace?.admin} companyName={company?.name} />
              <SecurityApiSection />
            </>
          )}

          {activeTab === 'team' && (
            <TeamMembersSection admin={workspace?.admin} companyName={company?.name} />
          )}

          {activeTab === 'security' && (
            <>
              <SecurityApiSection />
              <EnterprisePlanCard totalEmployees={workspace?.totalEmployees ?? company?.totalEmployees} />
              <DangerZoneSection />
            </>
          )}

          <p className="pt-4 text-center text-xs text-slate-400">PagerLook Employer v2.4.0</p>
        </div>
      </div>
    </EnterpriseLayout>
  )
}

export default Settings
