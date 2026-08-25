/**
 * BOSS wordmark: unified primary blue, geometric sans, single base bar.
 * Building Outstanding Smart Skills: Global Academy of Technology
 */
type BrandLogoProps = {
  /** `light`: primary blue on white. `dark`: light wordmark for dark backgrounds (e.g. footer). */
  variant?: 'light' | 'dark'
  /** `lg` nav, `md` compact, `sm` footer */
  size?: 'sm' | 'md' | 'lg'
  /** Nav link hover (parent should use `group`) */
  interactive?: boolean
  className?: string
}

const sizeClasses = {
  lg: {
    word: 'text-[1.875rem] sm:text-[2.125rem] md:text-[2.5rem] leading-none',
    sub: 'text-[0.6875rem] sm:text-[0.8125rem] md:text-[0.875rem]',
    bar: 'mt-[0.4rem] sm:mt-[0.45rem] md:mt-[0.5rem] h-[3px]',
    subGap: 'mt-[0.35rem] sm:mt-2',
  },
  md: {
    word: 'text-2xl sm:text-3xl leading-none',
    sub: 'text-[0.65rem] sm:text-xs',
    bar: 'mt-2 h-[3px]',
    subGap: 'mt-1.5',
  },
  sm: {
    word: 'text-xl leading-none',
    sub: 'text-[0.65rem]',
    bar: 'mt-[0.35rem] h-[2.5px]',
    subGap: 'mt-1.5',
  },
} as const

export default function BrandLogo({
  variant = 'light',
  size = 'lg',
  interactive = false,
  className = '',
}: BrandLogoProps) {
  const s = sizeClasses[size]
  const isLight = variant === 'light'

  const wordClass = isLight ? 'text-primary-600' : 'text-white'
  const barClass = isLight ? 'bg-primary-600' : 'bg-white/90'
  const subClass = isLight ? 'text-[#475569] font-semibold' : 'text-slate-400 font-semibold'
  const hoverWord = interactive
    ? isLight
      ? 'group-hover:text-primary-700 transition-colors duration-200'
      : 'group-hover:text-white/95 transition-colors duration-200'
    : ''

  return (
    <div className={`inline-flex flex-col w-fit ${className}`}>
      <div
        className={`inline-flex items-baseline font-heading font-extrabold uppercase ${s.word} tracking-[-0.065em]`}
      >
        <span className={`${wordClass} ${hoverWord}`}>BOSS</span>
      </div>
      <div className={`w-full rounded-sm ${barClass} ${s.bar}`} aria-hidden />
      <p
        className={`${s.sub} ${s.subGap} ${subClass} tracking-[-0.02em] leading-tight max-w-[16.5rem]`}
      >
        Global Academy of Technology
      </p>
    </div>
  )
}
