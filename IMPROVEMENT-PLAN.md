# Chapter treatment comparison

Implemented locally in `dist/index.html`, `dist/style.css`, `dist/planner.js`, and `dist/treatment-data.js`, with the original exercise retained in `dist/app.js`. See README.md for behavior, tests, and remaining browser checks.

## Default view

Keep the current blue, white, and serif-heading style. Make the page easy to scan:

1. A collapsed **Your chapter** section. Its summary shows the chapter name or a short excerpt of the event once entered.
2. One compact line for the selected scene purpose, with a **Settings** disclosure for purpose families, practice scope, length, Explore, and locks.
3. Three treatment cards: **Straightforward**, **Unexpected**, and **Experimental**.
4. A collapsed **Your selected plan** section once a treatment is chosen.

Each treatment card initially shows only:

- Opening name
- Structure name
- Information order
- Ending type
- **Details** toggle and **Use this** button

No examples, teaching paragraphs, tradeoff explanations, or editable beat fields appear until expanded. On narrow screens, stack the compact cards vertically.

## Your chapter

Inside the disclosure, provide three optional text fields:

- What happens?
- What changes?
- What should the reader feel or wonder at the end?

Retain notes while comparing and rerolling. When expanded, keep them beside or above the comparison. These are planning notes; the static app does not interpret them as an AI prompt or claim that random candidates are personalized to their content.

## Treatment details

Each independent Details toggle reveals:

- Useful when
- Reader effect
- Watch out for
- A compact preview of the original beats
- A separately collapsed example

Use curated guidance attached to structures or explicitly named structure families. Keep guidance distinct from the user's own chapter notes.

## Candidate generation

Compare the same scene purpose across all three treatments. Generating alternatives must not silently change the underlying purpose or overwrite the selected plan.

Use grounded, exploratory, and experimental catalog pools for the three columns. Preserve existing locks and practice scope. If a purpose has no mapped structure in a treatment's pool, explain that constraint instead of labeling an unrelated structure as a mapped match. Show when a lock makes treatments share the same form.

## Endings and information order

Offer endings such as a decision, reversal, revelation, unresolved image, and emotional settling. Offer orders such as chronological, consequence before cause, delayed context, and repeated event from different perspectives.

Keep the selected labels visible on compact cards. Put explanations and changes inside Details. Present information order as an optional adaptation, with a reminder to check whether it conflicts with the original structural rule.

## Editable selected plan

**Use this** creates an editable plan from the candidate's beats. Inside the collapsed plan section, allow renaming, adding, removing, and moving beats up or down, plus scene notes for each beat. Provide keyboard-operable controls; do not rely on drag and drop.

Keep edits when exploring other candidates. Explicitly confirm replacement if choosing another treatment would discard an edited plan. Once adapted, distinguish the user's plan from the original teaching blueprint.

Copy/export includes the chapter notes, selected treatment, ending, information order, and edited beats. Keep the existing generic exercise-copy option separately available.

## Disclosure behavior and scope

- All optional information starts collapsed.
- Changing a choice does not unexpectedly close an expanded section or move keyboard focus.
- Use native details/summary elements or buttons with aria-expanded and aria-controls.
- Keep existing catalogs, direct selection, rolls, locks, and exercises accessible.
- Do not add named chapter storage, local persistence, book-wide analysis, AI services, or a framework.
- Notes and edits remain in memory for this session; clearly offer copying before leaving.

## Acceptance checks

Verify compact desktop/mobile layouts, keyboard toggles, stable notes during rerolls, purpose matching across treatment pools, lock preservation, edited-plan retention, beat reordering, and copy/export contents. Test user-entered text as text rather than HTML.
