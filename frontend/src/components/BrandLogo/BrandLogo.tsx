import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: number;
  animated?: boolean;
  variant?: string;
}

export default function BrandLogo({ size = 40, animated = true, variant = 'default' }: BrandLogoProps) {
  const s = typeof size === 'number' ? size : 40;

  const logo = (
    <svg width={s} height={s} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="112" height="112" rx="24" fill="#0F172A" stroke="#D97706" strokeWidth="2.5" />
      <rect x="12" y="12" width="96" height="96" rx="18" fill="rgba(217,119,6,0.06)" />
      <line x1="28" y1="60" x2="92" y2="60" stroke="rgba(217,119,6,0.15)" strokeWidth="1" />
      <text x="60" y="74" textAnchor="middle" fill="#D97706" fontFamily="'Montserrat',sans-serif" fontWeight="900" fontSize="44" letterSpacing="-3">360</text>
      <circle cx="24" cy="24" r="3" fill="#D97706" opacity="0.4" />
      <circle cx="96" cy="96" r="3" fill="#D97706" opacity="0.4" />
    </svg>
  );

  if (!animated) return logo;

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'inline-flex', lineHeight: 0 }}
    >
      {logo}
    </motion.div>
  );
}
