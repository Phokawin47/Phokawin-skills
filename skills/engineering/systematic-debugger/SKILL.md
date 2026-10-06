---
name: systematic-debugger
description: >
  Systematically diagnose and fix software failures by reproducing the issue,
  tracing execution and data flow, generating and falsifying hypotheses,
  identifying the proven root cause, applying the smallest safe fix, and
  verifying it with regression tests. Use when something is broken, failing,
  behaving unexpectedly, producing wrong results, throwing intermittent errors,
  or when the user asks to debug, diagnose, investigate, find the root cause,
  or fix an observed software problem.
---

# Systematic Debugger

Debug observed software failures through evidence, not guesses.

The goal is not merely to make the error disappear.

The goal is to establish:

Symptom → Failure mechanism → Root cause → Fix → Verification

## Core Rules

1. Never confuse the error location with the root cause.
2. Never modify production code before understanding the failure path.
3. Never claim a root cause without evidence.
4. Change one variable at a time during diagnosis.
5. Prefer the smallest experiment that can falsify a hypothesis.
6. Prefer the smallest code change that fixes the proven root cause.
7. A fix is not complete until the original failure is reproduced and shown to pass.
8. Do not hide a failure by adding broad try/except, fallback values,
   retries, sleeps, or null checks unless they address the actual root cause.

---

# Phase 1 — Define the Failure

Establish the observed behavior.

Capture:

- Expected behavior
- Actual behavior
- Error message / stack trace
- Input that triggers it
- Environment
- Relevant configuration
- Frequency:
  - deterministic
  - intermittent
  - environment-specific

Separate:

Symptom:
What the user observes.

Failure:
Where the system behavior first becomes incorrect.

Root cause:
Why that incorrect state became possible.

Do not treat these as interchangeable.

---

# Phase 2 — Reproduce

Create the smallest reliable reproduction possible.

Preferred forms:

1. Existing failing test
2. New regression test
3. CLI command
4. curl/API request
5. Minimal script
6. Controlled manual steps

Record:

- command
- input
- output
- environment
- pass/fail signal

If reproduction is flaky, improve reproduction reliability before changing code.

If reproduction cannot be established, explicitly mark:

DEBUG STATUS: NOT YET REPRODUCIBLE

Do not claim a root cause.

---

# Phase 3 — Trace the Failure Path

Trace the actual execution path from entry point to failure.

Examples:

Frontend
→ API route
→ service
→ repository
→ database

or

CLI
→ parser
→ configuration
→ business logic
→ external service

For each boundary inspect:

- input
- output
- state mutation
- branch conditions
- assumptions
- exceptions

Find the earliest point where:

Expected state != Actual state

That point is more valuable than the final crash location.

---

# Phase 4 — Inspect Data Flow

For bugs involving incorrect values, trace the value backward.

Ask:

Where was this value created?
Where was it transformed?
Where was it validated?
Where did it first become incorrect?

Trace:

Source
→ Transformation
→ Validation
→ Consumer

Inspect:

- type
- nullability
- shape
- units
- encoding
- timezone
- ordering
- defaults
- serialization
- database representation

Do not patch the consumer if the producer is generating invalid state.

---

# Phase 5 — Generate Hypotheses

Create 3–5 plausible root-cause hypotheses.

Rank them:

H1 — Most likely
H2 — Plausible
H3 — Less likely

For each hypothesis define:

Evidence supporting it
Evidence contradicting it
Experiment that would prove it
Experiment that would falsify it

Example:

H1: Cache contains stale schema

Supports:
- failure only occurs after deployment

Contradicts:
- clean environment also fails

Falsification:
- bypass cache and rerun repro

Never commit to the first plausible explanation.

---

# Phase 6 — Run Diagnostic Experiments

Choose the experiment with the highest information gain.

Good experiments change one variable.

Examples:

- bypass one layer
- replace dependency with known input
- compare working vs failing request
- inspect DB row
- freeze time
- disable feature flag
- run single-threaded
- pin dependency version
- compare environment variables
- checkout previous commit
- add temporary instrumentation

Record every experiment.

| Experiment | Changed | Result | Interpretation |
|-----------|---------|--------|----------------|
| E1 | Disable cache | Still fails | Cache unlikely |
| E2 | Known DB row | Passes | Input-dependent |
| E3 | Null field | Fails | Null path implicated |

Never repeat experiments without explaining what new information they provide.

---

# Phase 7 — Establish Root Cause

A root cause must explain all known observations.

Use this test:

"If this root cause were removed, would the bug stop occurring?"

Root cause statement format:

Because [condition],
[component] produces [incorrect state],
which flows through [path],
causing [observed failure].

Example:

Because `discount_code` is nullable in the database,
`load_user()` can return `None`.
`calculate_discount()` assumes the value is always a string
and calls `.lower()`, causing the checkout request to fail.

Root cause confidence:

CONFIRMED
HIGH
MEDIUM
LOW

Only use CONFIRMED when an experiment directly validates the mechanism.

---

# Phase 8 — Design the Fix

Before editing code, determine where the invariant should be enforced.

Prefer fixing at:

1. Source of invalid state
2. Boundary validation
3. Domain invariant
4. Consumer guard

Avoid masking the symptom.

Bad fix:

```python
try:
    process(value)
except Exception:
    pass
```

Better fix:

validate the invariant at the boundary where invalid data enters.

Keep the fix surgical.

Do not refactor unrelated code during debugging.

---

# Phase 9 — Implement

Modify only files required by the proven root cause.

Before changing code:

- identify affected files
- identify existing tests
- capture baseline

After changing code:

- run targeted failing test
- run nearby tests
- run project test/type/lint commands when practical

If a diagnostic log or probe was added, remove it unless it provides lasting observability value.

---

# Phase 10 — Verify

Verification requires:

1. Original repro now passes.
2. New regression test passes.
3. Related existing tests pass.
4. No new warnings/errors appear.
5. Expected behavior remains unchanged for valid inputs.

If only the symptom disappears but the mechanism was not validated:

DEBUG STATUS: FIX UNVERIFIED

Do not declare success.

---

# Final Report

Return:

## Problem
What was observed.

## Expected
What should happen.

## Reproduction
How the failure was reproduced.

## Failure Path
Execution/data path to the failure.

## Root Cause
Exact mechanism.

## Evidence
Experiments or code evidence proving it.

## Fix
What changed and why.

## Files Changed
List files and purpose.

## Verification
Tests/commands executed and results.

## Regression Risk
Potential side effects.

## Confidence
Confirmed / High / Medium / Low
