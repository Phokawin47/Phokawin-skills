---
name: scrutinize
description: Reviews a plan, PR or code change from an outsider's view - first questions the intent and whether a simpler approach reaches the same goal, then traces the real code path (not just the diff) to verify the change does what it claims. Output is concise, actionable, with a rationale per finding. Use on /scrutinize and proactively whenever the user asks to review, audit, sanity-check or get a second opinion on a plan, PR, diff, design doc, report draft or proposed change; also Thai phrasings such as "รีวิวให้หน่อย", "ช่วยตรวจ PR", "ดูแผนนี้หน่อย", "แผนนี้โอเคไหม", "มีวิธีที่ง่ายกว่านี้ไหม", "ขอ second opinion".
---

# Scrutinize

Stand outside the change and ask whether it should exist at all, then verify it actually does what it claims end-to-end.

**Freedom level:** medium — the four steps and the report shape are fixed; what to trace and which risks to probe is your judgment.

## Report language

Applies to the whole review.

1. If the user already named a language this session, or CLAUDE.md / memory records one, use it without asking.
2. Otherwise ask once, before the first message: "จะให้รายงานเป็นภาษาอะไร — ไทย หรือ English?" (suggest Thai) and wait. If the answer is vague, use Thai. Do not ask again this session, whichever skill runs next.
3. Keep code, identifiers, commands, `file:line` references and quoted error strings in their original language.

## Checklist

```
- [ ] 1 Intent stated in one sentence; simpler alternative considered   ← cannot state it: say the artifact is underspecified, stop
- [ ] 2 Real code path traced end-to-end (including unchanged code around the diff)
- [ ] 3 Each claim checked: path walked, breaking inputs listed, silent changes listed, tests checked
- [ ] 4 Findings written with file:line, consequence, evidence, minimal change; verdict last
- [ ] 5 Re-read your own findings: any without a cited trace step?   ← yes: go back to 2 or drop the finding
```

## Operating stance

- **Outsider.** Forget who wrote it and why they think it's right. Read the artifact cold.
- **End-to-end, not diff-local.** The diff is the entry point, not the scope. Follow the call graph through real code paths.
- **Actionable, concise, with rationale.** Every finding states *what to change*, *why*, and *what evidence* led you there. No filler, no restating the diff back.

## Workflow

Run these in order. Do not skip ahead.

### 1. Intent — what is this actually trying to do?

- State the goal in one sentence, in your own words. If you cannot, the artifact is underspecified — say so and stop.
- Ask: **is there a simpler, smaller, or more elegant way to achieve the same goal?** Consider:
  - Doing nothing (is the problem real / load-bearing?).
  - Using something that already exists in the codebase instead of adding new surface.
  - A smaller change that solves 90% of the goal with 10% of the risk.
  - Solving it at a different layer (config vs code, framework vs app, build vs runtime).
- If a better alternative exists, name it explicitly with rationale. This is the most valuable thing you can output — surface it before the line-by-line review.

### 2. Trace — walk the actual code path

- For each behavior the change claims, trace the path end-to-end through the real code, not just the lines in the diff:
  - Entry point → call sites → branches taken → state mutated → exit / return / side effect.
  - Include the unchanged code on either side of the diff. Bugs hide at the seams.
- For a plan or design doc: trace the proposed flow against the existing system. Where does it touch reality? What does it assume that isn't true?
- Note every place the trace surprises you (unexpected branch, dead code reached, state you didn't know existed). Surprises are signal.

### 3. Verify — does it actually do what it claims?

For each claim the change/plan makes, answer:

- **Does the code path you just traced actually produce that behavior?** Walk it explicitly. "It claims X. Path: A → B → C. At C, [observation]. Therefore [holds / doesn't hold]."
- **What inputs / states would break it?** Edge cases, concurrent callers, error paths, partial failures, retries, empty/null/unicode/huge inputs, ordering assumptions.
- **What does it silently change?** Performance, error semantics, observability, contract for other callers, on-disk / on-wire format.
- **How is it tested?** Do the tests actually exercise the traced path, or do they pass while skipping it (mocks that hide the bug, asserts on intermediate state, happy path only)?
- **Stack-specific traps** — check the ones that apply: pandas index alignment / merge row counts / silent dtype changes; unseeded randomness or train-eval leakage in ML code; missing `await`, timezone and null handling at API boundaries; PowerShell 5.1 compatibility (`&&`, `??`), file encoding of Thai text, `$LASTEXITCODE` ignored; LaTeX engine/bibliography/stale `.aux` assumptions. Details in the `debug-mantra` skill's `references/stack-pitfalls.md` when available.

### 4. Report

Output one tight section per finding. Order by severity (blocker → major → nit). For each:

- **Finding** — one sentence, specific. Cite `file:line` when applicable.
- **Why it matters** — the consequence, not the principle.
- **Evidence** — the trace step or input that exposes it.
- **Suggested change** — concrete, minimal.

Close with a one-line verdict: ship / fix-then-ship / rework / reject — with the single biggest reason.

## Operating rules

- **No rubber-stamps.** "LGTM" is not an output. If you genuinely find nothing, say what you traced and what you checked, so the user can judge whether your review covered the surface they cared about.
- **Cite or it didn't happen.** Every claim about the code references a specific path, file, or line. No vague "this might break under load."
- **Distinguish claim from verification.** "The PR says X" and "I traced X and confirmed / refuted it" are different — keep them separate in the output.
- **One simpler-alternative pass is mandatory.** Even on small changes, spend one breath asking if the whole thing is necessary. Skip only if the user explicitly says "don't question scope."
- **Don't pad with style nits when there's a structural problem.** If step 1 or step 2 surfaces a real issue, lead with it; defer nits or drop them.
- **No flattery, no hedging.** "This is a great PR but..." adds nothing. State the finding.