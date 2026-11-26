interface TokenServiceLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 'w-8 h-8', text: 'text-lg' },
  md: { icon: 'w-10 h-10', text: 'text-xl' },
  lg: { icon: 'w-14 h-14', text: 'text-2xl' },
} as const;

export function TokenServiceLogo({
  size = 'md',
  showText = true,
  className = '',
}: TokenServiceLogoProps) {
  const { icon, text } = SIZE_MAP[size];

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="/tokenIconIA.png"
        alt="Emblema TokenService"
        className={`${icon} object-contain shrink-0 drop-shadow-sm`}
      />

      {showText && (
        <span className={`font-bold tracking-tight leading-none ${text}`}>
          <span className="text-stone-900">Token</span>
          <span className="text-amber-600">Service</span>
        </span>
      )}
    </span>
  );
}
