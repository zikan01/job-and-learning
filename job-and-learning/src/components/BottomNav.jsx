function HomeIcon({ active }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M3 12L12 3l9 9" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function BriefcaseIcon({ active }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2"/>
      <line x1="2" y1="13" x2="22" y2="13" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2"/>
    </svg>
  )
}
function ShoppingIcon({ active }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="6" x2="21" y2="6" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2"/>
      <path d="M16 10a4 4 0 01-8 0" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function BookIcon({ active }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2"/>
    </svg>
  )
}
function UsersIcon({ active }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function HelpIcon({ active }) {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="0.5" fill={active ? '#FF8C00' : '#9CA3AF'} stroke={active ? '#FF8C00' : '#9CA3AF'} strokeWidth="1"/>
    </svg>
  )
}

import { t } from '../lib/translations'

const TAB_ICONS = {
  home:      HomeIcon,
  jobs:      BriefcaseIcon,
  market:    ShoppingIcon,
  learning:  BookIcon,
  community: UsersIcon,
  help:      HelpIcon,
}

const TAB_IDS = ['home', 'jobs', 'market', 'learning', 'community', 'help']

export default function BottomNav({ tab, setTab, lang }) {
  const tr = t[lang] ?? t.ko

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
      <div className="max-w-2xl mx-auto flex">
        {TAB_IDS.map(id => {
          const Icon = TAB_ICONS[id]
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors"
            >
              <Icon active={tab === id} />
              <span className={`text-[9px] font-semibold truncate w-full text-center px-0.5 ${tab === id ? 'text-[#FF8C00]' : 'text-gray-400'}`}>
                {tr.tabs[id]}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
