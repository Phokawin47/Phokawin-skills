---
name: grill-me
description: Interviews the user relentlessly, Socratic style, to stress-test a plan, decision, requirement or architecture idea before any code is written. Chat mode (default) keeps everything in the conversation and writes no files; docs mode (`/grill-me docs`) also maintains a CONTEXT.md glossary and records hard-to-reverse decisions as ADRs in docs/adr/. Invoked by the user with /grill-me, or in Thai "ซักฉันหน่อย".
disable-model-invocation: true
argument-hint: "[docs] <the plan or idea to stress-test>"
---

# Grill Me

Interview the user until the plan has no untested assumptions left. The value is in the questions the user had not asked themselves, so do not accept the first answer when it hides a trade-off.

## Modes

| Mode | Trigger | Writes files? |
|------|---------|---------------|
| **chat** (default) | `/grill-me` | No. The synthesis stays in the conversation. |
| **docs** | `/grill-me docs`, or the user asks to record terms/decisions in the repo | Yes — `CONTEXT.md` and `docs/adr/` only. |

If the mode is unclear and the project is a real codebase, ask which one before the first round.

## Report language

Applies to every question, recommendation and summary in this skill.

1. If the user already named a language this session, or CLAUDE.md / memory records one, use it without asking.
2. Otherwise ask once, before the first message: "จะให้รายงานเป็นภาษาอะไร — ไทย หรือ English?" (suggest Thai) and wait. If the answer is vague, use Thai. Do not ask again this session, whichever skill runs next.
3. Keep code, identifiers, commands, file paths and domain terms in their original language. In docs mode, write `CONTEXT.md` and ADRs in the report language but keep the term the code uses as the canonical term.

**Freedom level:** high for the questions (judge what is worth asking); low for the files in docs mode (follow the two format references exactly).

## Operating principles

1. **Facts are your job, decisions are the user's.** If the answer is in the workspace — files, config, dependencies, code paths, git history — read it. Interview only on intent, requirements, constraints, trade-offs and preferences.
2. **Design tree, frontier, rounds.** Every decision exposes sub-decisions. The *frontier* is the set of questions whose prerequisites are settled. Ask the whole frontier in one round, then wait. After the answers, recompute the frontier.
3. **Always recommend.** Give a recommended answer with the reason for each question, so the user can reply "ok" when they agree.
4. **Challenge, don't transcribe.** If an answer contradicts an earlier one, the glossary, or the code you read, say so immediately and ask which is right.

## Round format

```markdown
❓ **Q1 — <title>**: <context and the distinct options>
➡️ **Recommendation**: <choice and why>

---

❓ **Q2 — <title>**: ...
➡️ **Recommendation**: ...
```

## Workflow

1. **Orient.** Parse the subject. In docs mode also read `CONTEXT.md` (or `CONTEXT-MAP.md`), `docs/adr/` and the relevant code.
2. **Compute the first frontier** and present it.
3. **Loop.** Process the answers. In docs mode, capture immediately (below) before the next round — do not batch. Recompute the frontier.
4. **Wrap up** when the frontier is empty and no critical assumption is untested: summarize the refined plan, the decisions taken, and what stays open. In docs mode, list the files touched.

## Docs mode

### `CONTEXT.md` — the domain glossary

- Challenge fuzzy or overloaded words (*Customer* vs *User* vs *Account*) and propose one canonical term.
- When the user's wording contradicts the glossary, call it out: "The glossary defines X as A, but you seem to mean B. Which is it?"
- Keep it at the repo root (or per context via `CONTEXT-MAP.md`). Glossary only — no implementation details, specs or task lists. Format rules: [references/CONTEXT-FORMAT.md](references/CONTEXT-FORMAT.md).

### `docs/adr/` — architectural decision records

Offer an ADR only when **all three** hold: hard to reverse, surprising without context, a real trade-off with genuine alternatives. Number sequentially (`docs/adr/0001-use-postgres.md`), 1–3 sentences: context, decision, why. Create the directory lazily. Format: [references/ADR-FORMAT.md](references/ADR-FORMAT.md).

Do not touch code in either mode. When the interview ends and the user wants tasks, hand off to `spec-to-tasks`.
