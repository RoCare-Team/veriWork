import { useState } from 'react'
import Button from './Button'
import { formatDate } from '../../utils/formatters'

/**
 * The conversation attached to an onboarding application. Rendered from both
 * sides — `viewerRole` decides which bubbles are "mine".
 */
function MessageThread({
  messages = [],
  viewerRole = 'company',
  onSend,
  isSending = false,
  isLoading = false,
  title = 'Messages',
  subtitle,
  placeholder = 'Write a message…',
}) {
  const [body, setBody] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    onSend?.(text, () => setBody(''))
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <h3 className="m-0 text-base font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="m-0 mt-1 text-xs text-slate-500">{subtitle}</p>}

      <div className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto">
        {isLoading ? (
          <p className="m-0 text-sm text-slate-400">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="m-0 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No messages yet. Ask a question and our team will reply here.
          </p>
        ) : (
          messages.map((m) => {
            if (m.isSystem) {
              return (
                <p key={m.id} className="m-0 text-center text-[11px] font-medium text-slate-400">
                  {m.body} · {formatDate(m.createdAt)}
                </p>
              )
            }
            const mine = m.authorRole === viewerRole
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {!mine && (
                    <p className="m-0 text-[10px] font-bold uppercase tracking-wide opacity-60">
                      {m.authorName}
                    </p>
                  )}
                  {m.documentKey && (
                    <p
                      className={`m-0 mt-0.5 text-[10px] font-semibold ${
                        mine ? 'text-white/70' : 'text-slate-500'
                      }`}
                    >
                      Re: {m.documentKey}
                    </p>
                  )}
                  <p className="m-0 mt-1 whitespace-pre-wrap text-sm">{m.body}</p>
                  <p className={`m-0 mt-1 text-[10px] ${mine ? 'text-white/60' : 'text-slate-400'}`}>
                    {formatDate(m.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <form className="mt-4 flex gap-2" onSubmit={submit}>
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          disabled={isSending}
          className="h-11 flex-1 rounded-ctl border border-line bg-surface px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
        />
        <Button type="submit" disabled={isSending || !body.trim()} fullWidth={false}>
          {isSending ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </section>
  )
}

export default MessageThread
