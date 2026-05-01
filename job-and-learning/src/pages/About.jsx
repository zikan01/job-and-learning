import { GraduationCap, Bot, Rocket, Users, Mail } from 'lucide-react'
import { t } from '../lib/translations'

const SERVICE_ICONS = [GraduationCap, Bot, Rocket, Users]

const gridBg = {
  backgroundImage: [
    'linear-gradient(to right, rgba(0,33,71,0.055) 1px, transparent 1px)',
    'linear-gradient(to bottom, rgba(0,33,71,0.055) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: '44px 44px',
}

export default function About({ lang }) {
  const tr = t[lang] ?? t.ko
  const at = tr.about

  return (
    <div className="bg-[#f6f8fb] min-h-screen" style={gridBg}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-[#002147]">
        {/* 장식 원 */}
        <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-[#FF8C00]/8 -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-72 h-72 rounded-full bg-white/4 translate-y-24 -translate-x-12 pointer-events-none" />
        {/* 배경 그리드 (히어로 전용) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: [
              'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px)',
              'linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '44px 44px',
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF8C00]/20 text-[#FF8C00] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-[#FF8C00] animate-pulse" />
            d2d4.kr · 잡앤러닝
          </div>
          <h1 className="font-outfit font-black text-3xl md:text-5xl text-white leading-tight mb-4">
            {at.heroTitle1}<br />
            <span className="text-[#FF8C00]">{at.heroTitle2}</span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto">{at.heroSub}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#f6f8fb] to-transparent pointer-events-none" />
      </div>

      {/* ── 본문 ── */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm border-t-4 border-t-[#002147]">
            <p className="text-xs font-bold text-[#002147]/50 uppercase tracking-widest mb-3">{at.missionTitle}</p>
            <h3 className="font-outfit font-black text-[#002147] text-xl mb-3">{at.missionHead}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{at.missionBody}</p>
          </div>
          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm border-t-4 border-t-[#FF8C00]">
            <p className="text-xs font-bold text-[#FF8C00]/70 uppercase tracking-widest mb-3">{at.visionTitle}</p>
            <h3 className="font-outfit font-black text-[#FF8C00] text-xl mb-3">{at.visionHead}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{at.visionBody}</p>
          </div>
        </div>

        {/* Core Services */}
        <div>
          <h2 className="font-outfit font-black text-[#002147] text-2xl md:text-3xl text-center mb-10">
            {at.servicesTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {at.services.map((svc, i) => {
              const Icon = SERVICE_ICONS[i]
              return (
                <div
                  key={svc.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#002147]/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FF8C00]/10 transition-colors">
                    <Icon size={22} className="text-[#002147] group-hover:text-[#FF8C00] transition-colors" />
                  </div>
                  <h4 className="font-outfit font-bold text-[#002147] text-sm mb-2">{svc.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{svc.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* CEO Message */}
        <div className="bg-[#002147] rounded-2xl p-8 md:p-12 relative overflow-hidden">
          {/* 장식 */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FF8C00]/8 translate-x-20 -translate-y-20 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-xs font-bold text-[#FF8C00] uppercase tracking-widest mb-6">{at.ceoTitle}</p>
            <blockquote className="text-white/80 text-base md:text-lg leading-relaxed italic mb-8 border-l-2 border-[#FF8C00] pl-5">
              {at.ceoQuote}
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FF8C00] flex items-center justify-center font-outfit font-black text-white text-lg flex-shrink-0">
                S
              </div>
              <div>
                <p className="font-outfit font-black text-white text-lg">{at.ceoName}</p>
                <p className="text-white/40 text-sm">{at.ceoRole}</p>
              </div>
              <a
                href="mailto:ceo@d2d4.kr"
                className="ml-auto flex items-center gap-2 text-[#FF8C00] text-sm font-semibold hover:underline flex-shrink-0"
              >
                <Mail size={14} />
                {at.ceoContact}
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
