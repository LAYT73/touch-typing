import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'

/** Conditional className joiner used by every component in the UI kit. */
export const cn = (...classes: ClassValue[]): string => clsx(classes)
