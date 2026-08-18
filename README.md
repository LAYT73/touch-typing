# Typeflow

A client-side touch typing trainer for English text, with a bilingual (EN/RU) interface, a dark
orange-accented theme and a keyboard-first workflow. No backend, no tracking: word lists and quotes
are plain files in `public/`, and everything you type is measured in the browser.

**[Live demo](https://layt73.github.io/touch-typing/)** · React 19 · TypeScript · Vite · Motion

---

## Features

- **Three test modes** — timed (15/30/60/120 s), fixed word count (10/25/50/100) and quotes
  (short / medium / long / any).
- **Endless timed tests** — the word buffer extends itself before you can reach the end.
- **Live metrics** — speed, accuracy and either the countdown or the word progress, updated every
  second while you type.
- **Result screen** — net and raw WPM, accuracy, consistency, a character breakdown and a custom SVG
  chart of speed over time with error markers.
- **Personal bests** — results are kept per configuration in `localStorage`, so a record only counts
  against comparable tests.
- **Text modifiers** — mix in punctuation and numbers; every text is reproducible from a seed, so
  "repeat this text" gives you the exact same words.
- **Virtual keyboard** — optional next-key highlighting for learning the layout.
- **Full localisation** — English and Russian, with real plural rules, persisted per browser.
- **Accessibility** — a labelled typing region, a spoken result summary, visible focus rings,
  keyboard-only operation and `prefers-reduced-motion` support.
- **Appearance settings** — caret style (line / block / underline), smooth caret, blind mode, live
  stats and keyboard visibility.

### Shortcuts

| Keys                           | Action                  |
| ------------------------------ | ----------------------- |
| any character                  | start the test          |
| <kbd>Space</kbd>               | submit the current word |
| <kbd>⌫</kbd>                   | fix the current word    |
| <kbd>Ctrl</kbd> + <kbd>⌫</kbd> | delete the whole word   |
| <kbd>Tab</kbd>                 | restart with a new text |
| <kbd>Esc</kbd>                 | restart the same text   |

## How the metrics are computed

| Metric          | Definition                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------- |
| **WPM**         | correct characters ÷ 5 ÷ minutes elapsed — a "word" is the standard five characters                |
| **Raw WPM**     | the same formula over every character produced, mistakes included                                  |
| **Accuracy**    | share of keystrokes that hit the right character _on the first attempt_; corrections don't heal it |
| **Consistency** | `1 − coefficient of variation` of the per-second raw speed, so 100% means a perfectly even pace    |
| **Characters**  | correct / incorrect / extra / missed, counted per word including the separating spaces             |

The timing is driven by the wall clock rather than by a tick counter, so a throttled background tab
cannot inflate a score.

## Tech stack

| Concern   | Choice                                                                                      |
| --------- | ------------------------------------------------------------------------------------------- |
| UI        | React 19 (with the React Compiler) + TypeScript in `strict` mode                            |
| Build     | Vite 8                                                                                      |
| Styling   | CSS Modules over a design-token layer, no CSS framework                                     |
| Animation | [Motion](https://motion.dev) — spring-driven caret and line scrolling                       |
| State     | `useReducer` for the typing session, Zustand (persisted) for settings and history           |
| i18n      | a hand-rolled, fully typed layer with `Intl.PluralRules` (95 keys per locale)               |
| Tests     | Vitest + Testing Library — 73 tests over the engine, stats, i18n, chart and the typing flow |
| Fonts     | Geist and JetBrains Mono, self-hosted via Fontsource                                        |

## Architecture

The source follows [Feature-Sliced Design](https://feature-sliced.design): layers may only import
from the layers below them, which keeps the dependency graph acyclic and every feature replaceable.

```
src/
├── app/            # shell, providers, global layout
├── widgets/        # compositions: Header, Footer, TypingTest
├── features/
│   ├── typing/     # session reducer, selectors, stats, typing surface
│   ├── words/      # data loading, parsing, deterministic text generation
│   ├── settings/   # persisted settings store, toolbar, settings dialog
│   ├── results/    # history store, WPM chart, result screen
│   └── keyboard/   # virtual keyboard
├── i18n/           # typed dictionaries, provider, translate helpers
└── shared/         # ui kit, hooks, utils, config, design tokens
```

Each feature exposes a single `index.ts`; nothing reaches into another feature's internals. Inside a
feature, `model/` holds pure logic and hooks, `api/` holds data access and `ui/` holds components.

Three decisions carry most of the design:

- **The typing engine is a pure reducer.** `sessionReducer` takes a timestamp with every keystroke
  instead of reading the clock, so the whole engine is deterministic and testable without fake
  timers. Every number on the result screen is derived from the recorded keystrokes.
- **Text is a function of (data, settings, seed).** Nothing about the current text is stored in
  state: a new text is a new seed, and a repeat is the same seed. Cosmetic settings therefore cannot
  disturb a running test.
- **Animation stays out of React.** The caret and the line scrolling are driven by Motion values
  written from layout effects, so a 60 fps caret costs zero re-renders.

## Data files

Text comes from static files, parsed at runtime, so adding vocabulary needs no code change.

`public/data/words/*.txt` — one word per line, `#` starts a comment:

```
# english-200 — 200 most frequent English words
the
of
and
```

`public/data/quotes/english.json` — public-domain quotes:

```json
{
  "language": "english",
  "quotes": [
    {
      "id": "austen-pride-1",
      "text": "It is a truth …",
      "author": "Jane Austen",
      "source": "Pride and Prejudice"
    }
  ]
}
```

To add a word list, drop the file in `public/data/words/` and register it in
`src/features/words/model/types.ts` plus `src/shared/config/test.ts`.

## Getting started

Requires Node 20.19+ (see `.nvmrc`).

```bash
npm install
npm run dev
```

| Script                  | What it does                                           |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | start Vite in development mode                         |
| `npm run build`         | typecheck and build to `dist/`                         |
| `npm run preview`       | serve the production build                             |
| `npm run typecheck`     | `tsc -b`                                               |
| `npm run lint`          | ESLint (type-aware)                                    |
| `npm run test`          | run the test suite once                                |
| `npm run test:coverage` | run the tests with a V8 coverage report                |
| `npm run validate`      | typecheck + lint + format check + tests, as CI does it |

## Code quality

- **TypeScript strict**, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- **Type-aware ESLint** with the React Hooks and React Compiler rules; Prettier owns formatting.
- **Husky + lint-staged** run ESLint and Prettier on staged files before every commit.
- **GitHub Actions** run `typecheck`, `lint`, `test` and `build` on every push, and deploy `main` to
  GitHub Pages with the correct base path.

## License

[MIT](./LICENSE). The bundled quotes are public domain, and the word lists are plain
frequency-ordered lists of common English words.
