import { useState } from 'react'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import { TeamMemberRow, SettingsMenuRow } from '../../components/enterprise/SettingsComponents'
import { TEAM_MEMBERS, SECURITY_MENU } from '../../utils/settingsData'

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

function TeamMembersSection() {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      <h3 className="m-0 text-base font-bold text-slate-900">Team Members</h3>
      <div className="mt-4">
        {TEAM_MEMBERS.map((member) => (
          <TeamMemberRow key={member.id} {...member} />
        ))}
      </div>
      <button
        type="button"
        className="mt-5 w-full rounded-xl border border-dashed border-[#1a3a8f]/30 py-3 text-sm font-semibold text-[#1a3a8f] transition hover:bg-blue-50"
      >
        + Invite Team Member
      </button>
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

function EnterprisePlanCard() {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#1a3a8f] to-[#2747b2] p-5 text-white shadow-lg md:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="m-0 text-lg font-extrabold">Enterprise Plan</h3>
        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1a3a8f]">
          Active
        </span>
      </div>
      <p className="mt-1 text-sm text-white/70">Next renewal: Nov 12, 2024</p>
      <div className="my-5 border-t border-white/20" />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="m-0 text-3xl font-extrabold">142 / 500</p>
          <p className="mt-1 text-sm text-white/70">Verified Employees</p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Manage Billing
        </button>
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

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 pb-10 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          title="Settings & Team"
          subtitle="Manage workspace and permissions"
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
                      defaultValue="Acme Technologies Pvt. Ltd."
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Timezone</label>
                    <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-[#1a3a8f]">
                      <option>Asia/Kolkata (GMT+5:30)</option>
                      <option>America/New_York (GMT-5)</option>
                      <option>Europe/London (GMT+0)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Default Language</label>
                    <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-[#1a3a8f]">
                      <option>English</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                </div>
              </section>
              <TeamMembersSection />
              <SecurityApiSection />
            </>
          )}

          {activeTab === 'team' && <TeamMembersSection />}

          {activeTab === 'security' && (
            <>
              <SecurityApiSection />
              <EnterprisePlanCard />
              <DangerZoneSection />
            </>
          )}

          <p className="pt-4 text-center text-xs text-slate-400">VeriWork Employer v2.4.0</p>
        </div>
      </div>
    </EnterpriseLayout>
  )
}

export default Settings
