/*
 * One source of truth for form control chrome.
 *
 * Input, Select and AutocompleteInput each grew their own height, radius and
 * type scale, so a row mixing them stepped up and down. They all render through
 * these helpers now — change it here and every field moves together.
 */

/** 48px — comfortable to tap and read; the 44px version felt cramped in long forms. */
export const FIELD_HEIGHT = 'h-12'

export const FIELD_WRAP = 'flex flex-col gap-1.5'

export const FIELD_LABEL = 'text-[13px] font-semibold text-ink-body'

/** Reserved one-line slot for hint/error text so messages never reflow a form. */
export const FIELD_MESSAGE = 'm-0 min-h-4 text-xs'

export function fieldControlClass({ error = false, leftIcon = false, rightSlot = false } = {}) {
  return [
    FIELD_HEIGHT,
    'w-full rounded-ctl border bg-surface px-3 text-sm text-ink-strong outline-none',
    'transition duration-150 ease-swift placeholder:text-ink-faint',
    'disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-faint',
    leftIcon ? 'pl-9' : '',
    rightSlot ? 'pr-10' : '',
    error
      ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
      : 'border-line hover:border-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25',
  ]
    .filter(Boolean)
    .join(' ')
}
