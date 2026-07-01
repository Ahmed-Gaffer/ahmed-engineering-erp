interface EmptyIllustrationProps {
  size?: number;
  accentColor?: string;
}

export default function EmptyIllustration({ size = 200, accentColor = '#D97706' }: EmptyIllustrationProps) {
  const s = typeof size === 'number' ? size : 200;
  const c = accentColor;

  return (
    <svg width={s} height={s * 0.75} viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="120" cy="90" r="70" fill={`${c}08`} />
      <circle cx="120" cy="90" r="48" fill={`${c}06`} />
      <rect x="72" y="62" width="96" height="60" rx="8" stroke={c} strokeWidth="2" fill={`${c}06`} />
      <line x1="88" y1="82" x2="152" y2="82" stroke={`${c}30`} strokeWidth="2" strokeLinecap="round" />
      <line x1="88" y1="96" x2="136" y2="96" stroke={`${c}20`} strokeWidth="2" strokeLinecap="round" />
      <line x1="88" y1="110" x2="144" y2="110" stroke={`${c}15`} strokeWidth="2" strokeLinecap="round" />
      <circle cx="168" cy="70" r="12" stroke="#0F172A" strokeWidth="2" fill="white" />
      <line x1="177" y1="79" x2="184" y2="86" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
