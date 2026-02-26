
"use client";

import { Phone, MessageCircle } from 'lucide-react';

const CONTACTS = [
  { label: 'Defesa Civil', number: '(32) 3690-7294', color: 'bg-orange-600' },
  { label: 'SAMU', number: '192', color: 'bg-red-600' },
  { label: 'Bombeiros', number: '193', color: 'bg-red-700' },
];

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 p-3 safe-area-inset-bottom">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-1">
        {CONTACTS.map((contact) => (
          <a
            key={contact.label}
            href={`tel:${contact.number.replace(/\D/g, '')}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors shrink-0"
          >
            <div className={`w-2 h-2 rounded-full ${contact.color} animate-pulse`} />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-slate-400">{contact.label}:</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100">{contact.number}</span>
          </a>
        ))}
        <a
          href="https://wa.me/553236907294"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/30 transition-colors shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] sm:text-xs font-bold text-emerald-300">WhatsApp Defesa Civil</span>
        </a>
      </div>
    </footer>
  );
}
