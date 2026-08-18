export interface KeyDefinition {
  id: string
  /** Character produced without Shift. */
  lower: string
  /** Character produced with Shift. */
  upper: string
  /** Visible caption; defaults to `lower`. */
  label?: string
  /** Relative width, where a letter key is 1. */
  width?: number
}

const SHIFTED: Record<string, string> = {
  '`': '~',
  '1': '!',
  '2': '@',
  '3': '#',
  '4': '$',
  '5': '%',
  '6': '^',
  '7': '&',
  '8': '*',
  '9': '(',
  '0': ')',
  '-': '_',
  '=': '+',
  '[': '{',
  ']': '}',
  '\\': '|',
  ';': ':',
  "'": '"',
  ',': '<',
  '.': '>',
  '/': '?',
}

const toKeys = (characters: string): KeyDefinition[] =>
  [...characters].map((character) => ({
    id: character,
    lower: character,
    upper: SHIFTED[character] ?? character.toUpperCase(),
  }))

export const SHIFT_KEY_ID = 'Shift'
export const SPACE_KEY_ID = 'Space'

const shiftKey = (side: 'left' | 'right'): KeyDefinition => ({
  id: `${SHIFT_KEY_ID}-${side}`,
  lower: '',
  upper: '',
  label: '⇧',
  width: 2.25,
})

/** ANSI layout, trimmed to the keys a typing test actually needs. */
export const KEYBOARD_ROWS: KeyDefinition[][] = [
  toKeys('`1234567890-='),
  toKeys('qwertyuiop[]\\'),
  toKeys("asdfghjkl;'"),
  [shiftKey('left'), ...toKeys('zxcvbnm,./'), shiftKey('right')],
  [{ id: SPACE_KEY_ID, lower: ' ', upper: ' ', label: '', width: 10 }],
]

export interface KeyMatch {
  keyId: string
  /** Whether Shift has to be held to produce the character. */
  shift: boolean
}

/** Finds the key that produces `character`, if the layout has one. */
export const findKey = (character: string): KeyMatch | null => {
  for (const row of KEYBOARD_ROWS) {
    for (const key of row) {
      if (key.lower === character) return { keyId: key.id, shift: false }
      if (key.upper === character && key.upper !== '') return { keyId: key.id, shift: true }
    }
  }
  return null
}

export const isShiftKey = (keyId: string): boolean => keyId.startsWith(SHIFT_KEY_ID)
