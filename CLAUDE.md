# Working rules for this repository

This repo contains Agent Skills. Each skill lives at `skills/<category>/<name>/SKILL.md`.

## When adding or editing a skill

- `SKILL.md` must start with YAML frontmatter containing `name` and `description`. Without it the skill will not be discovered.
- `name` must match the directory name exactly.
- `description` is the only trigger mechanism. It must state what the skill does AND the contexts and user phrasings that should invoke it — including phrasings that do not mention the skill by name.
- Keep the body under ~500 lines. Split longer material into `references/` and point to it from SKILL.md.
- Write instructions in the imperative. Explain why a rule exists rather than stacking MUSTs.
- Do not add advice the model already follows by default. A skill earns its context budget by encoding what is specific: thresholds, project commands, stop conditions, prohibitions.
- Write `description` in the third person ("Reviews…", "Creates…"), key use case first. Add Thai trigger phrases for every skill the model may invoke on its own.
- State a **freedom level** near the top (high = principles, medium = template/pseudocode, low = exact steps or script) and mix levels inside one skill only deliberately.
- Reference files stay one level deep from `SKILL.md` and are linked directly from it. Any file over ~100 lines starts with a table of contents.
- Multi-step workflows get a copy-and-tick checklist with explicit go-back lines ("if X fails, return to step N") and a verify-fix-reverify loop.
- Prefer a template (strict or starting point), input → output example pairs, or a conditional workflow over prose.
- Assume nothing is installed on another machine: list required tools and how to install them, and check with `Get-Command` / `which` before relying on them.
- A rule that must never be broken (for example "stage by path only") belongs in a `hooks:` entry in the skill's frontmatter, not only in prose.
- **Report language:** every skill except `caveman` carries the same "Report language" block — use a stated/recorded language, else ask once per session (suggest Thai, default Thai), keep code and identifiers untouched. Keep the block identical across skills when editing it.
- Test a skill with each model tier it will run on (smaller models: are the instructions sufficient? larger: is it over-explained?).

## Git

- Stage files by path. Do not use `git add -A`, `git add .`, or `git commit -a`.
- One skill change per commit.
- Conventional Commits: `feat(refactor): ...`, `docs(readme): ...`, `fix(skill): ...`

## Before committing a skill change

Verify the skill is discoverable:

```bash
npx skills add ./ --list
```

Then test triggering with a realistic user sentence that does not name the skill.
