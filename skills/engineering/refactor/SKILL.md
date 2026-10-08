---
name: refactor
description: Restructures existing code without changing its behavior - extracting functions, splitting oversized files, flattening nested conditionals, removing duplication, untangling a module that has become hard to change. Use whenever the user asks to refactor, clean up, tidy, simplify, restructure, "make this readable", "break this file apart", or reduce complexity, or asks for a behavior change in code too tangled to change safely (refactor first, then change). Also fires on Thai phrasings such as "จัดโครงสร้างโค้ดใหม่", "ทำให้อ่านง่ายขึ้น", "โค้ดรก ช่วยเก็บหน่อย", "แยกไฟล์ให้หน่อย", "ลดความซ้ำซ้อนของโค้ด". Not for adding features, fixing bugs or optimizing performance - those change behavior and belong in a separate pass.
hooks:
  PreToolUse:
    - matcher: "Bash|PowerShell"
      hooks:
        - type: command
          command: node
          args: ["${CLAUDE_SKILL_DIR}/hooks/guard.js"]
---

# Refactor

Refactoring means changing the shape of code while keeping its observable behavior identical. The hard part is not knowing the catalog of refactorings — it is proving that behavior did not change. Everything below exists to serve that proof.

The failure mode this skill prevents: a large, plausible-looking diff that silently changes an edge case, delivered with a confident claim that nothing broke. A refactor that cannot be verified is not a refactor, it is a rewrite with extra steps.

**Freedom level:** low for the gates, verification and prohibitions (they are fixed); medium for choosing and ordering refactorings (judgment guided by the risk order).

**Requires:** `git`, plus whatever the target project uses to test (see [Language-specific verification](#language-specific-verification)). The staging guard in `hooks/guard.js` needs `node`; without it, the no-`git add -A` rule applies by hand.

## Contents

- [Report language](#report-language) · [Core rules](#core-rules) · [Checklist](#checklist)
- [Phase 0 — Safety net](#phase-0--safety-net) · [Phase 1 — Survey and propose](#phase-1--survey-and-propose) · [Phase 2 — Execute](#phase-2--execute) · [Phase 3 — Report](#phase-3--report)
- [What counts as refactoring](#what-counts-as-refactoring-here) · [When not to refactor](#when-not-to-refactor) · [Judgment on patterns](#judgment-on-patterns) · [Prohibitions](#prohibitions) · [Language-specific verification](#language-specific-verification)

## Report language

Applies to what you tell the user — gate reports, proposals, the final report. Commit messages stay English.

1. If the user already named a language this session, or CLAUDE.md / memory records one, use it without asking.
2. Otherwise ask once, before the first message: "จะให้รายงานเป็นภาษาอะไร — ไทย หรือ English?" (suggest Thai) and wait. If the answer is vague, use Thai. Do not ask again this session, whichever skill runs next.
3. Keep code, identifiers, commands and file paths in their original language.

## Checklist

Copy into the reply and tick as you go.

```
- [ ] Phase 0: verification commands found, baseline run saved, tree clean   ← GATE 0 fails: report, offer (a)/(b)/(c), stop
- [ ] Phase 1: proposal sorted mechanical → invasive, within 5 files / 400 lines   ← GATE 1: wait for the user's pick
- [ ] Phase 2 (per item): change → verify → commit
      verification red → revert the change, back to Phase 1 for that item (do not patch forward)
- [ ] GATE 2: stop, no extra "while I was here" edits
- [ ] Phase 3: report with real command output and named deferred items
```

## Core rules

1. **Establish verification before touching code.** If there is no way to detect a behavior change, stop and say so before editing.
2. **One refactoring at a time.** Apply, verify, commit. Never batch unrelated changes into one edit.
3. **Report facts, not reassurance.** "Tests pass" is only sayable after running them and reading the output. If tests were not run, say they were not run.
4. **Stop at the gates.** Defined below. Do not push past a gate on the assumption the user would have approved.
5. **Narrower is better.** When unsure whether something is in scope, leave it and list it as deferred.

## Phase 0 — Safety net

Do this before reading the target code in depth.

1. Identify how this project verifies itself. Look in `package.json` scripts, `Makefile`, `pyproject.toml`, `tox.ini`, `pytest.ini`, `.github/workflows/`, `justfile`, `CONTRIBUTING.md`. Record the exact commands for: tests, type check, lint, build.
2. Find which tests actually cover the target code. Grep for the module/class/function names in the test tree. A repo-wide green suite means nothing if zero tests import the file being changed.
3. Run the full verification chain **now**, before any edit, and save the output. This is the baseline. A pre-existing failure discovered after editing will otherwise be blamed on the refactor.
4. Check the working tree is clean (`git status`). Refactoring on top of uncommitted work makes the diff unreviewable.

**GATE 0 — stop and report if any of these hold:**

- No test command exists, or the target code has no test coverage.
- The baseline run already fails.
- The working tree has uncommitted changes.

Report what was found and offer options rather than proceeding. For the no-coverage case, the options are usually:

- **(a)** Write characterization tests first — tests that assert current behavior, including behavior that looks wrong. They pin the code down so the refactor is verifiable. Recommended when the code is important or the refactor is non-trivial.
- **(b)** Refactor with types/linter/build as the only net, limited to mechanical changes an IDE could do (rename, extract, move) — no logic restructuring. Acceptable for small, well-understood code.
- **(c)** Don't refactor. Sometimes correct.

State a recommendation and let the user choose.

## Phase 1 — Survey and propose

Read the target code fully before proposing anything. Then write a proposal containing, for each candidate:

- **What** — the specific change, e.g. "extract lines 88–140 of `parse_header` into `_normalize_encoding`".
- **Evidence** — the concrete observation that motivates it: "this 14-line block appears in three functions", "cyclomatic branching reaches 5 levels", "`parse()` is 280 lines handling four responsibilities". Not "improves readability".
- **Risk** — mechanical / moderate / invasive. Mechanical = rename, extract, move, dead-code removal. Invasive = changes control flow, touches shared state, alters an interface.
- **Verification** — which tests will catch a mistake in this specific change.

Order the list by risk ascending: mechanical changes first, so the code is cleaner and better understood before anything invasive is attempted.

**GATE 1 — present the proposal and stop.** The user picks which items to do. Do not begin editing on an implied yes.

Default scope ceiling for one run: **5 files or 400 changed lines**, whichever comes first. If the target exceeds this, propose a split into runs and let the user choose where to start. A 2,000-line diff does not get reviewed, it gets rubber-stamped, which defeats the purpose.

## Phase 2 — Execute

For each approved item, in order:

1. Make the single change.
2. Run the verification chain from Phase 0.
3. If it fails: revert the change (`git checkout -- <file>`) and report. Do not patch forward to make a red test green — a failing test after a refactor means behavior changed, and the change was wrong. Investigate first, then either redo it correctly or mark it as not-safely-refactorable.
4. If it passes: stage **only the files this change touched**, by path. Never `git add -A` or `git add .`.
5. Commit. One refactoring, one commit.

Commit message format:

```
refactor(<scope>): <what moved, in the imperative>

<why, one or two lines — the smell being removed>
Behavior unchanged; <verification command> passes.
```

Example:

```
refactor(parser): extract encoding normalization from parse_header

The same 14-line charset fallback was duplicated in parse_header,
parse_footer and parse_inline.
Behavior unchanged; pytest tests/parser passes (43 passed).
```

If the change spans files that must move together to stay consistent (e.g. a function and its only caller, or two copies of a pipeline that must not diverge), they belong in the **same** commit. A commit that leaves the repo in a non-building state is a bug.

**GATE 2 — after the approved items are done, stop.** Report and wait. Do not continue into "while I was in there I also noticed…" work. Collect those as named deferred items (`FIX1`, `FIX2`, …) in the report.

## Phase 3 — Report

```markdown
## Refactor report

**Scope:** <files touched>
**Verification:** <exact commands run> — <result, with numbers>
**Baseline before:** <result>

### Applied
- <commit subject> — <one-line effect>

### Not applied
- <item> — <why: rejected, too risky, out of scope>

### Deferred (named, not done)
- FIX1: <description>

### Behavior risk
<Anything that could conceivably have changed and is not covered by a test. If nothing, say which tests give that confidence — not "no risk".>
```

## What counts as refactoring here

**In scope** — extract function/method/component; inline a needless indirection; rename for accuracy; move code nearer its use; split a file by responsibility; replace nested conditionals with guard clauses and early returns; replace magic values with named constants; delete dead code and unused imports; convert callback pyramids to async/await; deduplicate genuinely identical logic.

**Out of scope** — changing behavior, fixing bugs, adding features, performance optimization, dependency upgrades, reformatting untouched code, altering public API signatures, changing test assertions. Each of these is a legitimate task, but it belongs in its own commit and its own conversation. If a bug is spotted mid-refactor, do not fix it silently: preserve the behavior, and report the bug as a deferred item.

The distinction matters because a refactor commit is reviewed with an assumption of "this cannot have changed anything". Smuggling a bug fix into one breaks that assumption for every future reviewer.

## When not to refactor

Recognize these and say so rather than producing work:

- **The code is ugly but stable and untouched.** Churn has cost and no benefit here. Refactor code you are about to change, not code that offends you.
- **A rewrite is actually the answer.** If the design is wrong rather than the shape, incremental refactoring produces a tidy version of the wrong thing. Say that instead.
- **The user needs a behavior change soon.** Refactor only the part that blocks it, then hand back.
- **Generated code, vendored code, or files marked do-not-edit.**

## Judgment on patterns

Design patterns are the most common way a refactor makes code worse. Apply this filter:

- **Strategy / polymorphism instead of a conditional** — only at three or more variants that are genuinely open-ended. Two variants are an `if`.
- **Builder** — only when the constructor has many optional parameters and callers actually vary them. Three arguments is not "complex object construction".
- **Composition over inheritance** — when the hierarchy is being used for code reuse rather than an is-a relationship, or when a subclass overrides behavior it does not want. Not as a blanket rule.
- **Extract function** — when the block has a nameable purpose, or is duplicated. Not merely because a function exceeded some line count. A 60-line function doing one linear thing is often clearer than six 10-line functions that must be traced across a file.
- **Introducing an interface or abstract base** — only with two or more real implementations today. Not for a hypothetical future one.

The honest default is the simplest structure that removes the observed problem. If a proposed pattern cannot be tied to a specific pain in this code, drop it.

## Prohibitions

- No `git add -A`, `git add .`, or `git commit -a`.
- No `git push`, no force operations, no branch deletion, no history rewriting.
- No edits outside the approved scope, including auto-formatting files not otherwise touched.
- No changes to test files — except when adding characterization tests under option (a), which is its own gate and its own commit. Never modify an existing assertion to make it pass.
- No deleting code because it "looks unused" without grepping for references, including string-based lookups, reflection, DI registration, and config files.
- No claiming verification that was not run.
- No proceeding past a gate without an explicit answer.

## Language-specific verification

Use the project's own commands when they exist; fall back to these only to check the codebase's health.

| Stack | Tests | Types | Lint |
|---|---|---|---|
| Python | `pytest` | `mypy .` / `pyright` | `ruff check .` |
| TypeScript | `npm test` | `tsc --noEmit` | `eslint .` |
| Go | `go test ./...` | (compiler) | `go vet ./...` |
| Rust | `cargo test` | `cargo check` | `cargo clippy` |
| Java | `mvn test` / `gradle test` | (compiler) | — |
| PowerShell | `Invoke-Pester` | — | `Invoke-ScriptAnalyzer -Path .` |
| LaTeX | build with the project script (`latexmk -pdf` / `build.ps1`), zero new errors/warnings in the `.log` | — | `chktex` |

For Python specifically, `git diff` on `.py` files hides nothing but indentation changes can alter scope silently — read the diff, do not just trust the test run.

**Code with no tests — scripts, notebooks, data/ML pipelines, PowerShell, LaTeX.** These usually fail Gate 0, so this is where option (a) applies. Pin behavior with a golden output instead of unit tests:

- Data / ML script: fix the seed, run on a small fixed input, save the output (CSV/parquet/metrics) before editing, then compare byte-for-byte or with `pandas.testing.assert_frame_equal` / `numpy.testing.assert_allclose` after each step. Notebooks: restart and run all before and after, compare the cell outputs that matter.
- PowerShell / CLI script: run with representative arguments, capture stdout, stderr and exit code (`$LASTEXITCODE`) before and after.
- LaTeX: build before and after, then compare the extracted text (`pdftotext`) and the page count; a layout-only refactor of macros must produce identical text.

Treat a diff in the golden output as a failed verification, the same as a red test. Keep golden files out of the commit unless the user asks for them.

Dependencies for these checks (`pytest`, `ruff`, `pester`, `PSScriptAnalyzer`, `latexmk`, `poppler`'s `pdftotext`) are assumed installed by nobody — verify with `Get-Command <tool>` / `which <tool>` first, and tell the user which are missing rather than installing silently.
