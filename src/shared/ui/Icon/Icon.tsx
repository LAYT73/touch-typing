import type { SVGProps } from 'react'
import { iconPaths } from './icons'
import type { IconName } from './icons'
import styles from './Icon.module.css'
import { cn } from '@/shared/lib/utils'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'children'> {
  name: IconName
  /** Any CSS length. Defaults to `1.25em` so icons scale with their label. */
  size?: string | number
  /** Provide a label to expose the icon to assistive tech; omit for decoration. */
  label?: string
}

export const Icon = ({ name, size = '1.25em', label, className, ...rest }: IconProps) => (
  <svg
    className={cn(styles.icon, className)}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={label ? undefined : true}
    role={label ? 'img' : undefined}
    aria-label={label}
    {...rest}
  >
    {iconPaths[name].map((path) => (
      <path key={path} d={path} />
    ))}
  </svg>
)
