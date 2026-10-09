import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-panel rounded-xl border border-line ${className}`}>{children}</div>;
}
export function Row({ k, v, className = '' }: { k: ReactNode; v: ReactNode; className?: string }) {
  return (
    <div className={`flex justify-between items-center text-[13px] py-1 ${className}`}>
      <span className="text-muted">{k}</span>
      <span className="num">{v}</span>
    </div>
  );
}
export function Btn({ children, onClick, tone = 'neutral', className = '', disabled }: { children: ReactNode; onClick?: () => void; tone?: 'up' | 'down' | 'accent' | 'neutral' | 'warn'; className?: string; disabled?: boolean }) {
  const t = { up: 'bg-up text-white', down: 'bg-down text-white', accent: 'bg-accent text-bg', neutral: 'bg-panel2 text-txt', warn: 'bg-warn text-bg' }[tone];
  return (
    <button disabled={disabled} onClick={onClick} className={`h-11 px-4 rounded-lg font-semibold active:opacity-80 disabled:bg-panel2 disabled:text-muted disabled:opacity-60 ${t} ${className}`}>
      {children}
    </button>
  );
}
export function NumField({ label, value, onChange, step = 'any', suffix }: { label: string; value: string; onChange: (v: string) => void; step?: string; suffix?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted">{label}</span>
      <div className="flex items-center bg-panel2 rounded-lg border border-line h-11 px-3">
        <input inputMode="decimal" type="number" step={step} value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent flex-1 min-w-0 outline-none num text-[15px]" />
        {suffix && <span className="text-muted text-xs ml-1">{suffix}</span>}
      </div>
    </label>
  );
}
export function TextField({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: 'text' | 'password' | 'url'; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted">{label}</span>
      <div className="flex items-center bg-panel2 rounded-lg border border-line h-11 px-3">
        <input type={type} value={value} placeholder={placeholder} autoComplete="off" autoCapitalize="off" spellCheck={false} onChange={(e) => onChange(e.target.value)} className="bg-transparent flex-1 min-w-0 outline-none text-[13px]" />
      </div>
    </label>
  );
}
export function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button onClick={() => onChange(!on)} className="w-full flex items-center justify-between py-3 text-left">
      <span>
        <span className="block text-[14px]">{label}</span>
        {hint && <span className="block text-[11px] text-muted">{hint}</span>}
      </span>
      <span className={`w-12 h-7 rounded-full relative transition ${on ? 'bg-accent' : 'bg-panel2 border border-line'}`}>
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${on ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  );
}
export function Chips<T extends string | number>({ items, value, onChange, fmt }: { items: readonly T[]; value: T; onChange: (v: T) => void; fmt?: (v: T) => string }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((it) => (
        <button key={String(it)} onClick={() => onChange(it)} className={`px-3 h-8 rounded-full text-sm ${value === it ? 'bg-accent text-bg font-semibold' : 'bg-panel2 text-muted'}`}>
          {fmt ? fmt(it) : String(it)}
        </button>
      ))}
    </div>
  );
}
