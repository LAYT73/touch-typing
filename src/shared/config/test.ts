/**
 * Vocabulary of a typing test, shared by every layer: the settings store owns
 * the *current* values, while these unions define what values may exist.
 */

export const TEST_MODES = ['time', 'words', 'quote'] as const
export type TestMode = (typeof TEST_MODES)[number]

export const TIME_OPTIONS = [15, 30, 60, 120] as const
export type TimeOption = (typeof TIME_OPTIONS)[number]

export const WORD_COUNT_OPTIONS = [10, 25, 50, 100] as const
export type WordCountOption = (typeof WORD_COUNT_OPTIONS)[number]

export const QUOTE_LENGTHS = ['short', 'medium', 'long', 'any'] as const
export type QuoteLength = (typeof QUOTE_LENGTHS)[number]

export const WORD_LIST_IDS = ['english-200', 'english-1000'] as const
export type WordListId = (typeof WORD_LIST_IDS)[number]

export const CARET_STYLES = ['line', 'block', 'underline'] as const
export type CaretStyle = (typeof CARET_STYLES)[number]

/** Words generated up front in time mode, per second of test duration. */
export const WORDS_PER_SECOND_BUFFER = 3
export const MIN_GENERATED_WORDS = 60
export const MAX_GENERATED_WORDS = 400

/** When fewer words than this remain, an endless test asks for more. */
export const EXTEND_THRESHOLD_WORDS = 20
export const EXTEND_CHUNK_WORDS = 40
