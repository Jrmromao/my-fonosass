# Fixing Incoherent Speech-Therapy Activities

**Status:** Implemented (Problems 1–7) — pending fonoaudióloga sign-off on the
A-vs-B clinical decision and on bank/dataset curation depth (Problems 6–7).
**Scope:** `lib/activities/` content pipeline (NOT the image model)
**Audience:** Developer + supervising fonoaudióloga (one clinical decision required)

---

## TL;DR

Some generated activities "don't make sense" even though the images are clean and
the gates pass. The cause is **not** the image model and **not** the LLM — it is
logic gaps in how words are selected from the curated bank, *after* every existing
gate has run. Reviewing two high-quality competitor worksheets (see
[Quality bar](#quality-bar--reference-worksheets)) confirms this and adds two more
gaps: the bank lacks the data (theme tags, per-cell depth) and the renderer lacks
the layout to produce that class of sheet.

| # | Problem | File | Severity | Fix effort |
|---|---------|------|----------|-----------|
| 1 | Distractors can also be "correct answers" (self-contradicting sheet) | `wordBank.ts` / `validateContent.ts` | **High** | Small |
| 2 | `position` (initial/medial/final) is tracked but never used for selection | `wordBank.ts`, `generateContent.ts` | **High** (clinical) | Medium |
| 3 | Activity title claims a theme the words don't match; no theme data to fix it | `generate-content.ts`, `wordBank.ts` | **High** | Medium |
| 4 | No coherence gate before S3 upload (image gate exists, content gate doesn't) | new | Medium | Medium |
| 5 | Card-sort renderer isn't at the reference quality bar (labeled cards, category zones) | `sortRenderer.ts`, `sortActivity.ts` | Medium | Large |
| 6 | Bank too shallow to fill a *phoneme ∧ position ∧ theme* sheet | `wordBank.ts` | **High** | Large (curation) |

Do **1** first (smallest change, removes the worst failure). Then **2**, **3**,
**4**. Problems **5**/**6** are a larger workstream to reach the reference quality
bar and depend on the theme tags from Problem 3.

---

## Quality bar — reference worksheets

Two competitor worksheets define the target quality. Keep them as a *standard to
match*, not to copy — layout, mascot/characters, and exact wording must be our
own to avoid IP issues.

**Reference A — `WhatsApp Image 2026-10-28 at 15.44.12.jpeg`**
"COMO CADA BICHO SE MOVE?" — a **categorize-by-attribute** cut-and-sort sheet.
12 numbered, labeled animal cards (CARACOL, COBRA, ARARA, TIGRE, CANGURU,
TARTARUGA, CORUJA, GRILO, GIRAFA, MACACO, TUBARÃO, LAGARTIXA) are sorted into 6
labeled destination boxes by how they move (VOAM, NADAM, ANDAM, RASTEJAM, SALTAM,
ESCALAM). Each box has an icon; a footer gives the verbal cue ("Diga o nome do
bicho e como ele se move antes de colar!"). This is a *semantic* task, not a
phoneme task — a new activity type for us (see Problem 7).

**Reference B — `WhatsApp Image 2026-10-28 at 16.18.39.jpeg`**
"MERCADO DO S" — a **phoneme** cut-and-sort sheet, directly in our domain. A
shopping list + cart, 6 numbered labeled food cards: SUCO, SAL, SALSICHA, SALADA,
SORVETE, SALAME. What makes it coherent — and what our pipeline cannot currently
guarantee:
- **Single phoneme, single position:** every word is /S/ in **initial** position
  (Problem 2 — our `positions` field is unused).
- **Real, consistent theme:** every card is genuinely a food, matching the
  "Mercado" (market) theme (Problem 3 — we have no theme data).
- **Target restated on the sheet:** footer "...sem esquecer o S do começo!"

> Reality check: our current `S` bank is
> `SAPO, SOL, SACO, SINO, SUCO, PASTA, FESTA, CESTA, LACO, PALHACO, CABECA, PRINCESA`.
> Of these, only `SUCO` is both /S/-initial **and** a food. We **cannot build
> "Mercado do S" today** — not a model problem, a *data* problem (Problems 3 & 6).

Common structure both share, which our renderers don't yet produce: themed
header, a grid of **labeled numbered cards** with cut lines + scissor marks,
destination/category zones (Reference A), and a spoken-practice footer.

---

## ⚠️ One clinical decision blocks the correct fix for #1

Before writing code, the supervising fonoaudióloga must answer:

> In a **FIND_CIRCLE** activity targeting phoneme /X/, is the "correct answer"
> defined by:
>
> - **(A) The written letter/grapheme** — e.g. for /S/, any word containing the
>   letter S, so `ROSA`, `CASA`, `BLUSA` all count as correct; **or**
> - **(B) The actual phoneme (sound)** — e.g. for /S/ (voiceless), `SAPO` and
>   `PASTA` count, but `ROSA`/`CASA` do **not**, because the "s" there is voiced
>   /z/.

This matters because the two are not the same in Portuguese (`casa`, `rosa` are
spelled with "s" but pronounced /z/). The curated bank is built on definition
**(B)** — the sound. The grapheme heuristic in `validateContent.ts`
(`containsPhoneme`) implements definition **(A)** — the letter.

**The bug exists because the pipeline uses (A) and (B) in the same activity.**
Pick one and use it everywhere. For a *speech-therapy* product the clinically
correct choice is almost certainly **(B)**, but confirm before implementing.

Record the decision here:

```
DECISION: B  (A = grapheme / B = phoneme-sound)
Decided by: implemented per doc recommendation — PENDING fonoaudióloga sign-off
Date: 2026-11-04
```

> ⚠️ Implemented on the doc's recommended default (B, phoneme-sound). The
> supervising fonoaudióloga must still confirm. If the decision is actually (A),
> `carriesPhoneme()` in `wordBank.ts` is the single switch point to change.

---

## Problem 1 — Distractors that are also correct answers

### What happens

`FIND_CIRCLE` asks the child to circle words that contain the target phoneme and
leave the distractors alone. Distractors come from `getDistractors()` in
`wordBank.ts`, which pulls words from *other* phonemes' banks and only excludes a
word if `isVettedWord(word, targetPhoneme)` is true.

But answers are scored elsewhere with the lenient grapheme heuristic
`containsPhoneme()` in `validateContent.ts`. These two checks disagree.

### Concrete failure (target phoneme = `S`)

- `getDistractors('S', …)` returns `ROSA` (from the `Z` bank). It is not *vetted*
  for `S`, so it passes the distractor filter.
- Later, `containsPhoneme('ROSA', 'S')` is **true** (the letter `S` is present),
  so the same word is treated as a correct answer.
- Result: a word is printed as a distractor but also satisfies the "correct"
  rule. The answer key is self-contradicting.

This ships every time a distractor word happens to contain the target
grapheme — common for S/Z, C/K, G/J overlaps.

### Fix (after the clinical decision)

**If decision = (B), the sound — recommended:**

1. Make `containsPhoneme()` authoritative via the bank for curated phonemes,
   instead of falling back to the grapheme heuristic when a vetted word exists.
   The heuristic should only ever be a last resort for *non-curated* phonemes,
   and even then it must not be used to score a word that is a vetted member of a
   *different* phoneme's bank.
2. In `getDistractors()`, exclude any word for which `containsPhoneme(word,
   targetPhoneme)` would return true under the **same** function used to score
   answers. One source of truth for "does this word carry the phoneme."

**Acceptance check (must hold for every generated FIND_CIRCLE):**

```
for every item in items:
    isAnswer   = item ∈ answers
    carriesPhoneme = containsPhoneme(item, phoneme)   // the ONE agreed definition
    assert isAnswer === carriesPhoneme
```

If that invariant ever fails, the activity is incoherent by construction.

### Files

- `lib/activities/wordBank.ts` → `getDistractors()`, `isVettedWord()`
- `lib/activities/validateContent.ts` → `containsPhoneme()`,
  `validateWordListActivity()`

---

## Problem 2 — `position` is recorded but never used

### What happens

Every `BankWord` carries a clinically meaningful `positions: Position[]`
(`'initial' | 'medial' | 'final'`). Targeting a phoneme *in a specific position*
is core speech-therapy practice (initial /R/ is a different target from medial
/R/). But `getBankWords()` filters only by `syllables <= maxSyllablesForAge` and
**ignores `positions` entirely**.

### Why it reads as "doesn't make sense"

An activity meant to drill **initial /R/** ends up mixing `RATO` (initial),
`CACHORRO` (medial), and coda-R words. To a layperson it looks fine; to a
fonoaudióloga it's an untargeted grab-bag — i.e. clinically wrong.

### Fix

1. Add an optional `position?: Position` to the activity request in
   `generateContent.ts` (and thread it from `generate-content.ts`; default can be
   `'initial'` or "any", per clinical guidance).
2. Add a `position` filter to `getBankWords()` and `getDistractors()`:
   keep a word only if `word.positions.includes(targetPosition)` (when a target
   position is specified).
3. Reflect the position in the title/instructions (e.g. "som /R/ no início das
   palavras") so the sheet states its own target.

### Files

- `lib/activities/wordBank.ts` → `getBankWords()`, `getDistractors()`
- `lib/activities/generateContent.ts` → activity request type + call sites
- `scripts/generate-content.ts` → pass a position when generating

---

## Problem 3 — Title/theme doesn't match the words (and we lack the data to fix it)

### What happens

`scripts/generate-content.ts` assigns a `topic` ("animais", "comida", …) and uses
it in the title/instructions, but backfilled words come from the phoneme bank
with **no topic filtering**. So a sheet titled "Animais" can contain `PORTA`,
`CARTA`, `FESTA`. Reference B ("Mercado do S") shows the bar: a themed sheet where
**every** card satisfies the theme *and* the phoneme/position simultaneously.

### Fix — two parts (the second is now required, not optional)

**Part 1 (stopgap): stop lying in the title.** Until theme data exists, use a
neutral always-true title like `Palavras com o som /S/ no início` (phoneme +
position from Problem 2). A mismatched label is worse than no label.

**Part 2 (required for reference quality): add theme tags to the bank.** Add a
`themes` tag to each `BankWord` so a sheet can require *phoneme ∧ position ∧
theme*. This is the data prerequisite for Problems 5 and 6.

```ts
// wordBank.ts — proposed schema extension
export type Theme =
  | 'animais' | 'alimentos' | 'objetos' | 'natureza'
  | 'corpo' | 'roupas' | 'transporte' | 'casa' | 'brinquedos';

export interface BankWord {
  word: string;
  positions: Position[];
  syllables: number;
  themes?: Theme[];   // NEW — a word may belong to several (e.g. SUCO: alimentos)
}
```

Then `getBankWords()` / `getDistractors()` take an optional `theme` and keep a
word only if `w.themes?.includes(theme)`. When a themed request can't be filled
from the bank, the generator must **refuse** (see Problem 6), never pad with
off-theme words.

### Worked example — building "Mercado do S" (Reference B)

Request: `{ phoneme: 'S', position: 'initial', theme: 'alimentos', cards: 6 }`.

Needs 6 words that are **all three**: /S/-initial **and** a food. Current `S`
bank yields only `SUCO`. Required bank additions (initial /S/ + alimentos):

| Word | position | themes | syllables |
|------|----------|--------|-----------|
| SUCO | initial | alimentos | 2 |
| SAL | initial | alimentos | 1 |
| SALSICHA | initial | alimentos | 3 |
| SALADA | initial | alimentos | 3 |
| SORVETE | initial | alimentos | 3 |
| SALAME | initial | alimentos | 3 |

Only with these rows present can the pipeline produce the sheet. This is the
concrete shape of the "data problem, not model problem" point.

### Files

- `lib/activities/wordBank.ts` (schema + theme filtering + new curated rows)
- `lib/activities/generateContent.ts` (thread `theme` through the request)
- `scripts/generate-content.ts` (title/instructions; pass a theme)

---

## Problem 4 — Add a content coherence gate (mirror the image gate)

### Rationale

`illustrator.ts` already fails closed on bad *images* (vision gate, threshold,
fallback). There is no equivalent gate asserting the *activity* is coherent
before it is uploaded to S3 and sent for review. Add one so a bad sheet can never
reach a therapist, exactly like a bad image can't.

### What the gate asserts (fail closed → skip upload, log, notify)

For every activity, before `uploadToS3`:

- FIND_CIRCLE: the answer/distractor invariant from Problem 1 holds.
- Every answer word carries the phoneme in the **declared position** (Problem 2).
- No duplicate words across items.
- All words respect the age syllable cap.
- WORD_SEARCH / CROSSWORD: every listed word is actually placed in the grid
  (the validators already rebuild grids — assert `placed ⊇ items`).
- Title/instructions are non-empty and don't claim an unverified topic
  (Problem 3).

### Files

- New: `lib/activities/coherenceGate.ts` (pure function, unit-testable)
- `scripts/generate-content.ts` → call the gate between render and upload;
  on failure, skip and `sendTelegram` a warning (consistent with current flow)

---

## Problem 5 — Card-sort renderer below the reference quality bar

### What happens

We already have `sortActivity.ts` + `sortRenderer.ts` and a `sort` command, which
is the right building block for the reference sheets. But the output isn't yet at
the standard of References A/B, which share a specific anatomy:

- Themed header band with title + decorative motifs.
- A grid of **labeled, numbered cards**: clip-art + word + number badge, each with
  a cut border (dashed) and a scissor mark.
- **Destination/category zones** with their own label + icon (Reference A's VOAM
  / NADAM / ... boxes; Reference B's shopping cart + checklist).
- A **spoken-practice footer** restating the task/target.

### Fix

Bring `sortRenderer` up to that anatomy: card component (image/word/number/cut
line), a configurable set of destination zones, header + footer bands. Keep all
text code-rendered (never from the image model). Treat the two reference JPEGs as
the visual acceptance target (match quality, not design).

### Files

- `lib/activities/sortRenderer.ts`, `lib/activities/sortActivity.ts`

---

## Problem 6 — Bank too shallow to fill a *phoneme ∧ position ∧ theme* sheet

### What happens

The reference sheets work because every card satisfies all active constraints at
once. With theme tags (Problem 3) a request becomes a 3-way filter
(*phoneme ∧ position ∧ theme*), and most bank cells are currently empty or
near-empty — e.g. initial-/S/ + alimentos has exactly one word (`SUCO`).

### Fix

- Define a **minimum depth per used cell** (e.g. ≥ `cardCount` words for any
  (phoneme, position, theme) a sheet can request).
- Curate the bank up to that depth for the target combinations, with the
  supervising fonoaudióloga vetting each word (correct phoneme + position).
- The generator must **refuse and log** when a cell is under-filled rather than
  pad with off-theme/off-position words. Under-filling is a content bug, not a
  render fallback.

### Files

- `lib/activities/wordBank.ts` (curation + a `cellDepth(phoneme, position, theme)`
  helper the coherence gate / generator can check)

---

## Problem 7 — New activity type: categorize-by-attribute (Reference A)

### What happens

"Como cada bicho se move?" is **not** a phoneme activity — it's a semantic
categorization task (sort items into attribute buckets). Our current types are all
phoneme-based, so this is a genuinely new generator, not a tweak.

### Fix (scoped separately — larger)

- New content model: a set of items, a set of categories, and a known
  item→category mapping (vetted, unambiguous — each item in exactly one bucket).
- Reuse the Problem 5 card/zone renderer for layout.
- Likely a curated dataset (animals→movement, etc.) rather than LLM-generated, for
  the same correctness reasons the phoneme content is curated.

### Files

- New: `lib/activities/categorizeActivity.ts` + renderer reuse from Problem 5

---

## Suggested order & verification

1. **Clinical decision** (A vs B) recorded above.
2. **Problem 1** fix + unit test proving the invariant on S/Z and C/K/G/J cases.
3. **Problem 2** position threading + unit test (initial-only request yields
   only initial-position words).
4. **Problem 3** title stopgap (Part 1) immediately; theme-tag schema (Part 2).
5. **Problem 4** gate + tests, wired into the script.
6. **Problem 6** curate bank depth for the first target combinations (e.g.
   initial-/S/ + alimentos, to enable a real "Mercado do S").
7. **Problem 5** renderer upgrade to the reference quality bar.
8. **Problem 7** categorize-by-attribute type (optional, largest).

Problems 1–5 restore *coherence* and *quality* for the activity types we already
ship. Problems 6–7 are about matching the competitor's *range*.

### Tests (project uses Jest — see `jest.config.js`)

- `__tests__/unit/activities/wordBank.test.ts` — distractor exclusion, position
  filtering, age caps.
- `__tests__/unit/activities/validateContent.test.ts` — the answer/distractor
  invariant; grapheme-vs-bank agreement.
- `__tests__/unit/activities/coherenceGate.test.ts` — gate rejects each failure
  class.

Run:

```bash
yarn test --testPathPattern=activities
yarn type-check
```

### Definition of done

- The Problem 1 invariant holds for every generated FIND_CIRCLE (asserted by the
  gate, covered by tests).
- Position-targeted requests produce position-consistent words.
- No activity ships with a topic in its title that its words don't satisfy.
- `yarn type-check` and the activities test suite pass.

---

## Explicitly out of scope

- Swapping the image model (`gemini-2.5-flash-image`) or the vision model. The
  incoherence is injected in the content layer *after* image generation; a
  different image/LLM model does not address any of Problems 1–7.
- Copying the competitor worksheets. References A/B set the *quality bar* only;
  layout, characters, and wording must be original.

---

## Reference files

- `WhatsApp Image 2026-10-28 at 15.44.12.jpeg` — Reference A ("Como cada bicho se
  move?", categorize-by-attribute).
- `WhatsApp Image 2026-10-28 at 16.18.39.jpeg` — Reference B ("Mercado do S",
  phoneme + theme cut-and-sort).

Stored outside the repo (shared via WhatsApp). Consider committing anonymized
copies to `docs/assets/` if they should travel with this doc.
