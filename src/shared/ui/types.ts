/**
 * Base props for components that accept an extra class.
 *
 * `undefined` is spelled out because `noUncheckedIndexedAccess` types CSS module
 * lookups as `string | undefined`, and `exactOptionalPropertyTypes` would
 * otherwise reject `className={styles.maybeMissing}`.
 */
export interface StyleableProps {
  className?: string | undefined
}
