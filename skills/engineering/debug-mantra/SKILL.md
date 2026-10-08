---
name: debug-mantra
description: Guides evidence-first debugging - reproduce, trace the fail path, falsify hypotheses, log every run in a ledger, fix only the proven root cause, then verify with a regression test. Use proactively whenever debugging starts - the user says something is broken, failing, crashing, throwing, flaky or giving wrong results; asks to debug, diagnose, investigate, find the root cause, review or check their code for bugs; or pastes a stack trace, error log or failing test. Also fires on Thai phrasings such as "บั๊ก", "พัง", "error", "รันไม่ผ่าน", "ผลลัพธ์ผิด", "ทำไมมันถึง...", "ช่วยดูโค้ดหน่อย", "หาสาเหตุให้หน่อย", "แก้ error ให้". Trigger on /debug-mantra.
---

# Debug Mantra

One discipline for every debug session: no fix before a reproduction, no root cause before the disproof was tried, no "fixed" before the original failure was shown to pass.

The failure mode this prevents: patching the line where the error surfaced, watching the symptom disappear, and declaring victory while the real cause is still live (a swallowed exception, a fallback value, a retry, a null check).

**Freedom level:** low for the order of steps and the stop conditions (they are gates); high for how to investigate inside each step.

Copy this checklist into the first reply and tick items as they are done. A failed check sends you back, never forward.

```
- [ ] 1 Repro exists (failing signal in ≤5 s)       ← none: stop, ask the user
- [ ] 2 Fail path found (first divergence located)   ← not found: back to 1, raise repro rate or add probes
- [ ] 3 3–5 hypotheses ranked, disproof run first    ← all dead: back to 2, widen the knobs
- [ ] 4 Ledger consistent with the surviving cause   ← a run contradicts it: back to 3
- [ ] 5 Root cause sentence written, confidence set
- [ ] 6 Smallest fix + regression test (fails before, passes after)
- [ ] 7 Verified: repro, regression and related tests pass    ← any red: back to 3
```

## Report language

Applies to everything said to the user in this skill — reports, summaries, questions, status notes.

1. If the user already named a language this session, or CLAUDE.md / memory records one, use it without asking.
2. Otherwise ask once, before the first message to the user: "จะให้รายงานเป็นภาษาอะไร — ไทย หรือ English?" (suggest Thai) and wait. If the answer is vague, use Thai. Do not ask again this session, whichever skill runs next.
3. Keep code, identifiers, commands, error strings, file paths and commit messages in their original language. Translate the prose around them, never them.

## Recite this — verbatim, in English, first thing after the language is settled

> **Mantra:**
> 1. **First is reproducibility.** Can the issue be reproduced reliably?
> 2. **Know the fail path.** Debugger first; then source trace + knob enumeration; then in-code instrumentation.
> 3. **Question your hypothesis.** What would disprove it?
> 4. **Every run is a breadcrumb.** Cross-reference all of them.

Recite once per session. If the user says "skip the mantra" (or "ไม่ต้องท่อง"), skip the recital but still follow the steps.

---

## 1. Reproduce reliably

Build a runnable repro before anything else. Capture the symptom first: expected vs actual behavior, exact error text, trigger input, environment, frequency (deterministic / intermittent / environment-specific).

- **Reliable repro** → save exact steps, inputs and environment as a runnable artifact: failing test, script, curl, CLI invocation. Target a 1–5 s deterministic pass/fail signal: pin time, seed the RNG, freeze the network, isolate the filesystem.
- **Flaky repro** → not yet debuggable. Raise the rate first: loop the trigger, add stress, narrow timing windows, inject sleeps. 50% flake is debuggable; 1% is not.
- **No repro** → stop. Print `DEBUG STATUS: NOT YET REPRODUCIBLE`, name what is missing (env access, logs, HAR, dump, permission to instrument) and ask. Do not hypothesise and do not claim a cause.

**Snippet-only mode.** When the user pasted code and nothing can be run, do a static review (syntax, logic, anti-patterns, the stack pitfalls below), but label every finding *unverified* and say what run would confirm it. Keep the user's intent — do not rewrite logic that only needs a one-line fix.

## 2. Know the fail path

Find where behavior first diverges from expectation — that point, not the crash site, is where the bug lives. Escalate only when the previous tactic fails:

1. **Debugger.** If available, step to the failure site. One breakpoint beats ten logs.
2. **Source trace + knob enumeration.** Trace entry → boundaries → failure, checking input, output, state mutation and branch conditions at each. List every knob that can move the outcome (config, env vars, flags, input shape, timing, concurrency, build options) and flip them one at a time.
3. **Instrumentation.** Log or print at the suspected site. Tag every probe with a unique prefix such as `[DBG-a4f2]` so cleanup is one grep. Remove probes before finishing unless they add lasting observability.

For wrong values, walk backwards: where was it created, transformed, validated, and where did it first become wrong? Check type, nullability, shape, units, encoding, timezone, ordering, defaults, serialization. Do not patch the consumer when the producer emits invalid state.

Read `references/stack-pitfalls.md` when the code involves Python/data/ML, web/backend, LaTeX, or Windows/PowerShell — it lists the failures specific to those stacks.

## 3. Falsify the hypothesis

Write 3–5 ranked hypotheses (H1 most likely). For each: evidence for, evidence against, the experiment that would prove it, and the one that would **disprove** it. Run the disproof first. A single hypothesis anchors on the first plausible idea.

## 4. Every run is a breadcrumb

Keep a ledger and update it after every run:

| Run | Changed | Result | Rules in / out |
|-----|---------|--------|----------------|
| E1 | Disabled cache | Still fails | Cache unlikely |

Change one variable per run. A new hypothesis must hold against **every** earlier row, not just the latest. When unsure, design the single experiment whose outcome settles it. Do not repeat a run without saying what new information it gives.

## 5. Establish the root cause

A root cause explains every observation and passes this test: *if it were removed, would the bug stop?* State it as:

> Because [condition], [component] produces [incorrect state], which flows through [path], causing [observed failure].

Example: *Because `discount_code` is nullable in the DB, `load_user()` returns `None`; `calculate_discount()` assumes a string and calls `.lower()`, so the checkout request fails with `AttributeError`.*

Give a confidence: CONFIRMED (an experiment directly validated the mechanism) / HIGH / MEDIUM / LOW. Never claim CONFIRMED otherwise.

## 6. Fix and verify

- Enforce the invariant as close to the source as possible: source of the invalid state → boundary validation → domain invariant → consumer guard (last resort).
- Smallest change that fixes the proven cause. No unrelated refactoring. No broad `try/except`, fallback value, retry, sleep or null check unless it addresses the actual cause.
- Add a regression test that fails before the fix and passes after. Capture a baseline of the surrounding tests first.
- Verified means: the original repro passes, the regression test passes, related tests pass, no new warnings, valid inputs behave as before. If only the symptom vanished, print `DEBUG STATUS: FIX UNVERIFIED` and do not declare success.

## Final report

```
## Problem        what was observed (and expected)
## Reproduction   command / input / signal
## Failure path   where behavior first diverged
## Root cause     the mechanism sentence + confidence
## Evidence       the ledger rows that prove it
## Fix            what changed and why there
## Files changed  path — purpose
## Verification   commands run and their results
## Regression risk
```

After a validated fix, offer to write it up with `post-mortem` — the ledger and failing test feed directly into it.

## Operating rules

- Order matters: no fix before #1, no hypothesis testing before #2 narrows the path, no commitment before #3 tried to disprove it, no "correct" before #4 checks it against every run.
- Caught proposing a fix without a repro → stop and return to step 1.
- Never say "tests pass" or "fixed" without having run the command and read its output; say what was not run.
- The mantra is a constraint you carry, not advice to hand back to the user.
