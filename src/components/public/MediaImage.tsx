import { cn } from '@/lib/cn'

type Aspect = 'hero' | 'card' | 'portrait' | 'square'

const aspectClass: Record<Aspect, string> = {
  hero: 'aspect-[4/3] sm:aspect-[5/4]',
  card: 'aspect-[16/10]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
}

type Props = {
  src: string
  alt: string
  aspect?: Aspect
  /** 'top' = flush top corners only (e.g. card header image) */
  corners?: 'all' | 'top'
  className?: string
  imgClassName?: string
  sizes?: string
  priority?: boolean
  hoverZoom?: boolean
}

export default function MediaImage({
  src,
  alt,
  aspect = 'card',
  corners = 'all',
  className,
  imgClassName,
  sizes,
    hoverZoom = false,
}: Props) {
  const cornerClass =
    corners === 'top'
      ? 'rounded-t-card rounded-b-none border-b-0 shadow-none'
      : 'rounded-card shadow-md'

  return (
    <div
      className={cn(
        'relative overflow-hidden border border-slate-200/90 bg-slate-100',
        cornerClass,
        aspectClass[aspect],
        hoverZoom && 'group',
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        className={cn(
          'w-full h-full object-cover object-center absolute inset-0',
          hoverZoom && 'transition-transform duration-500 ease-out group-hover:scale-[1.04]',
          imgClassName
        )}
      />
    </div>
  )
}
