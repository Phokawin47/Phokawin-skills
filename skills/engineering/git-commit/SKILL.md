---
name: git-commit
description: Creates Conventional Commit messages from the real diff and stages files by explicit path, one logical change per commit. Use when the user asks to commit, make a git commit, save or checkpoint changes, or types /commit; also Thai phrasings such as "คอมมิตให้หน่อย", "commit งานนี้", "เซฟงานลง git", "ทำ commit ให้". Blocks broad staging (git add -A, git add ., git commit -a) through a bundled hook.
license: MIT
allowed-tools: Bash, PowerShell
hooks:
  PreToolUse:
    - matcher: "Bash|PowerShell"
      hooks:
        - type: command
          command: node
          args: ["${CLAUDE_SKILL_DIR}/hooks/guard.js"]
---

# Git Commit

Turn the actual diff into a Conventional Commit. Never describe changes you did not read.

**Freedom level:** low for staging and safety (exact commands, no shortcuts); medium for the message (a fixed format, your wording).

**Requires:** `git`. The staging guard in `hooks/guard.js` needs `node` on PATH; if `node` is missing the guard does nothing, so the rules below still apply by hand.

## Report language

Applies to what you tell the user (summary, questions). The commit message itself stays English and Conventional, unless the user asks for another language.

1. If the user already named a report language this session, or CLAUDE.md / memory records one, use it without asking.
2. Otherwise ask once, before the first message: "จะให้รายงานเป็นภาษาอะไร — ไทย หรือ English?" (suggest Thai) and wait. If the answer is vague, use Thai. Do not ask again this session, whichever skill runs next.
3. Keep commands, paths, identifiers and error strings in their original language.

## Checklist

```
- [ ] 1 Read git status and the diff (staged first, else working tree)
- [ ] 2 Split into logical changes                 ← mixed concerns: commit them separately
- [ ] 3 Stage the files of ONE change by path
- [ ] 4 Re-read the staged diff (git diff --staged) ← secrets or unrelated lines: unstage, back to 3
- [ ] 5 Write the message, commit
- [ ] 6 Hook failed? Fix the cause, stage again, create a NEW commit   (never --amend, never --no-verify)
```

## 1–2. Read and split

```bash
git status --porcelain
git diff --staged        # if something is staged
git diff                 # otherwise
```

One commit = one logical change. If the diff mixes a feature, a refactor and a docs edit, make three commits.

## 3–4. Stage by path

```bash
git add path/to/file1 path/to/file2     # explicit paths only
git add -p path/to/file                 # one file, only part of its changes
```

Never use `git add -A`, `git add .`, `git add :/`, `git commit -a`. They pick up files you did not mean to include (build output, notebooks with outputs, `.env`). Never commit secrets: `.env*`, `credentials.json`, private keys, tokens, `*.pem`.

Check the staged diff for: debug probes (`[DBG-` prefixes, `print(` / `console.log`), large data files or model checkpoints, notebook output cells, LaTeX build artifacts (`.aux .log .toc .out .synctex.gz`), `node_modules/`, and CRLF-only whole-file diffs.

## 5. Message

```
<type>[scope]: <description>      # imperative, present tense, <72 chars, no period

[body: why, not what — only when the reason is not obvious]

[footer: Closes #123 / BREAKING CHANGE: ...]
```

Types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`. Add `!` after the type/scope for a breaking change. Pick the scope from the module or directory the diff touches.

Examples (input diff → message):

- New `--dry-run` flag in `cli/main.py` and its test → `feat(cli): add --dry-run flag`
- Fixes `<` to `<=` in token expiry check → `fix(auth): accept tokens expiring at the boundary`
- Only `report/ch3.tex` text edits → `docs(report): revise chapter 3 methodology`

Commit commands. Multi-line messages differ by shell:

```bash
# bash / Git Bash
git commit -m "$(cat <<'EOF'
feat(cli): add --dry-run flag

Lets users preview changes before writing files.
EOF
)"
```

```powershell
# Windows PowerShell — closing '@ must start at column 0
git commit -m @'
feat(cli): add --dry-run flag

Lets users preview changes before writing files.
'@
```

If the session instructions specify commit attribution lines (for example a `Co-Authored-By` trailer), append them as the last lines of the message.

## Safety

- Never edit git config, force-push, hard-reset, skip hooks, or amend a commit that failed its hook, unless the user explicitly asks.
- Never push unless asked. Committing and pushing are separate permissions.
- When unsure whether a file belongs in the commit, leave it out and say so.
