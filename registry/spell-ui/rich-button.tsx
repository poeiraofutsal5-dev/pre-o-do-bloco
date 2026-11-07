import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export type Color =
  | 'default'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'indigo'
  | 'violet'
  | 'rose'
  | 'amber'
  | 'lime'
  | 'sky'
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'fuchsia'
  | 'emerald';

export type SizeVariant = 'sm' | 'default' | 'lg';

export interface RichButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: Color;
  size?: SizeVariant;
  className?: string;
  asChild?: boolean;
}

const colorMap: Record<Color, string> = {
  default:
    'from-zinc-900/90 to-zinc-900 text-white',
  emerald: 'from-emerald-600/90 to-emerald-700 text-white',
  green: 'from-green-600/90 to-green-700 text-white',
  teal: 'from-teal-600/90 to-teal-700 text-white',
  cyan: 'from-cyan-600/90 to-cyan-700 text-white',
  blue: 'from-blue-600/90 to-blue-700 text-white',
  indigo: 'from-indigo-600/90 to-indigo-700 text-white',
  violet: 'from-violet-600/90 to-violet-700 text-white',
  purple: 'from-purple-600/90 to-purple-700 text-white',
  fuchsia: 'from-fuchsia-600/90 to-fuchsia-700 text-white',
  pink: 'from-pink-600/90 to-pink-700 text-white',
  rose: 'from-rose-600/90 to-rose-700 text-white',
  red: 'from-red-600/90 to-red-700 text-white',
  orange: 'from-orange-600/90 to-orange-700 text-white',
  amber: 'from-amber-600/90 to-amber-700 text-white',
  yellow: 'from-yellow-600/90 to-yellow-700 text-white',
  lime: 'from-lime-600/90 to-lime-700 text-white',
  sky: 'from-sky-600/90 to-sky-700 text-white',
  slate: 'from-slate-600/90 to-slate-700 text-white',
  gray: 'from-gray-600/90 to-gray-700 text-white',
  zinc: 'from-zinc-700/90 to-zinc-800 text-white',
  neutral: 'from-neutral-600/90 to-neutral-700 text-white',
  stone: 'from-stone-600/90 to-stone-700 text-white',
};

const textShadowMap: Record<Color, string> = {
  default: '[text-shadow:0_1px_0_rgba(0,0,0,0.7)]',
  emerald: '[text-shadow:0_1px_0_rgba(6,78,59,0.8)]',
  green: '[text-shadow:0_1px_0_rgba(20,83,45,0.8)]',
  teal: '[text-shadow:0_1px_0_rgba(19,78,74,0.8)]',
  cyan: '[text-shadow:0_1px_0_rgba(22,78,99,0.8)]',
  blue: '[text-shadow:0_1px_0_rgba(30,58,138,0.8)]',
  indigo: '[text-shadow:0_1px_0_rgba(49,46,129,0.8)]',
  violet: '[text-shadow:0_1px_0_rgba(76,29,149,0.8)]',
  purple: '[text-shadow:0_1px_0_rgba(88,28,135,0.8)]',
  fuchsia: '[text-shadow:0_1px_0_rgba(112,26,117,0.8)]',
  pink: '[text-shadow:0_1px_0_rgba(131,24,67,0.8)]',
  rose: '[text-shadow:0_1px_0_rgba(136,19,55,0.8)]',
  red: '[text-shadow:0_1px_0_rgba(127,29,29,0.8)]',
  orange: '[text-shadow:0_1px_0_rgba(124,45,18,0.8)]',
  amber: '[text-shadow:0_1px_0_rgba(120,53,15,0.8)]',
  yellow: '[text-shadow:0_1px_0_rgba(113,63,18,0.8)]',
  lime: '[text-shadow:0_1px_0_rgba(54,83,20,0.8)]',
  sky: '[text-shadow:0_1px_0_rgba(12,74,110,0.8)]',
  slate: '[text-shadow:0_1px_0_rgba(15,23,42,0.8)]',
  gray: '[text-shadow:0_1px_0_rgba(17,24,39,0.8)]',
  zinc: '[text-shadow:0_1px_0_rgba(24,24,27,0.8)]',
  neutral: '[text-shadow:0_1px_0_rgba(23,23,23,0.8)]',
  stone: '[text-shadow:0_1px_0_rgba(28,25,23,0.8)]',
};

const sizeMap: Record<SizeVariant, string> = {
  sm: 'h-8 rounded-lg gap-1.5 px-3 text-xs',
  default: 'h-9 px-4 py-2 text-sm rounded-xl',
  lg: 'h-11 rounded-xl px-6 text-base font-semibold',
};

export const RichButton = React.forwardRef<HTMLButtonElement, RichButtonProps>(
  (
    {
      children,
      color = 'default',
      size = 'default',
      className,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const colorClasses = colorMap[color] || colorMap.default;
    const textShadowClasses = textShadowMap[color] || textShadowMap.default;
    const sizeClasses = sizeMap[size] || sizeMap.default;

    return (
      <Comp
        ref={ref}
        className={cn(
          'cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-md shadow-zinc-950/15 border border-zinc-950/20 bg-gradient-to-b transition-all duration-200 hover:brightness-110 active:brightness-95 active:scale-[0.98]',
          colorClasses,
          sizeClasses,
          className
        )}
        {...props}
      >
        {asChild ? (
          children
        ) : typeof children === 'string' ? (
          <span className={cn('relative', textShadowClasses)}>
            {children}
          </span>
        ) : (
          <div
            className={cn(
              'relative flex items-center gap-2',
              textShadowClasses
            )}
          >
            {children}
          </div>
        )}
      </Comp>
    );
  }
);

RichButton.displayName = 'RichButton';
