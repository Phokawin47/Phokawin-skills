# Stack pitfalls

Check the section that matches the code before hypothesising. These are the failures that look like something else.

## Python / data / AI-ML

- **pandas**
  - `SettingWithCopyWarning` means a write may have gone to a copy — the value silently did not change.
  - `merge` on a non-unique key multiplies rows; compare `len()` before and after, or pass `validate="one_to_one"` / `"m:1"`.
  - Index alignment: assigning a Series built from another frame aligns on index, not position — wrong rows, no error.
  - `NaN` propagates through comparisons (`NaN != NaN`); an int column with a missing value silently becomes float.
  - `groupby` drops `NaN` keys unless `dropna=False`; `apply` can return a different shape for the first group vs the rest.
- **NumPy**: broadcasting hides shape bugs (`(n,)` vs `(n,1)` yields `(n,n)`); integer dtype overflow wraps silently; slices are views, so writes mutate the original.
- **Python**: mutable default arguments; late-binding closures in loops; `is` vs `==` on ints/strings; a generator is exhausted after one pass.
- **ML**
  - Missing `model.eval()` / `torch.no_grad()` leaves dropout/batch-norm in training mode.
  - Tensors on different devices or dtypes; `argmax` over the wrong dim.
  - Data leakage (fit scaler/imputer on the full set before the split); seeds set in one library but not the others.
  - Train/val/test preprocessing that differs; labels shuffled separately from features.
  - Loss going `nan`: check inputs for `inf`/`nan` first, then learning rate, then `log(0)` / division.
  - CUDA OOM that "appears randomly" is usually a tensor kept alive (storing `loss` instead of `loss.item()`).
- **Windows**: `DataLoader(num_workers>0)` and `multiprocessing` need an `if __name__ == "__main__":` guard (spawn re-imports the module); open text files with `encoding="utf-8"` (default is cp1252/cp874); a path like `"C:\new\table"` contains escapes — use raw strings or `pathlib`.
- **Notebooks**: out-of-order cell execution leaves stale state. Restart and run all before trusting any result.

## Web / backend

- Missing `await` returns a Promise/coroutine, which is truthy and "works" until it is serialized. Unhandled rejections vanish in some runtimes.
- `null` vs `undefined` vs `""` vs `0` at API boundaries; JSON drops `undefined` and cannot hold `NaN`/`Infinity`/`BigInt`.
- Timezones: naive vs aware datetimes, DB column type, server TZ vs client TZ; off-by-one at day boundaries; `<` vs `<=` on expiry checks.
- CORS errors are often a server 4xx/5xx with no CORS headers — read the network response, not just the console.
- Env vars: unset in the deployed environment, wrong `.env` loaded, value read at import time before it was set, quoting/whitespace in the value.
- Caching and stale builds: browser, CDN, ORM query cache, a dev server serving the old bundle. Bypass every layer once before theorising.
- N+1 queries and missing indexes show up as "slow on real data only". Migration drift: code and DB schema disagree — compare the live schema.
- Concurrency: check-then-act without a lock/transaction; retries that are not idempotent; connection pool exhaustion looks like random timeouts.
- Port already in use / zombie dev server: the code you edit is not the code that runs. Confirm which process answers.

## LaTeX / academic reports

- Read the **first** `!` error in the `.log` — later errors are usually cascades. Warnings that matter: `Undefined control sequence`, `Citation ... undefined`, `Reference ... undefined`, `Overfull \hbox`, `Float too large`.
- Stale auxiliary files cause ghost errors and wrong references: delete `.aux .toc .bbl .out` (or use `latexmk -C`) and rebuild. References/ToC need two or more passes; bibliography needs `bibtex`/`biber` between them.
- Engine mismatch: `fontspec`, `polyglossia`, system fonts and Thai text need XeLaTeX or LuaLaTeX; pdfLaTeX fails with obscure font errors. Biber vs BibTeX must match the `\usepackage[backend=...]{biblatex}` setting.
- Thai text: word breaking needs a Thai-aware setup (e.g. `\XeTeXlinebreaklocale "th"` under XeLaTeX, or polyglossia with Thai) — otherwise lines overflow. Missing glyphs mean the chosen font lacks the Thai range.
- Package load order and option clashes (`hyperref` last, `cleveref` after it); `inputenc` is not needed and can conflict under XeLaTeX/LuaLaTeX.
- Images/figures: wrong relative path after moving files, `\graphicspath`, spaces in file names, `Float too large`, figures drifting because of `[h]` — use `[htbp]` or `float` `[H]` deliberately.
- Verify visually: convert the PDF page to an image (e.g. `pdftoppm`) and look. A clean log does not mean a correct layout.

## Windows / PowerShell

- **Encoding**: Windows PowerShell 5.1 reads files without a BOM as ANSI — UTF-8 Thai text shows as mojibake and a "round trip" through `Set-Content`/`Out-File` can corrupt it. Use `Get-Content -Encoding UTF8`, `Set-Content -Encoding UTF8`, or write files with an editor/tool instead. Console code page: `chcp 65001` / `[Console]::OutputEncoding`.
- **Syntax gaps in 5.1**: no `&&` / `||`, no `?:`, `??`, `?.`. Chain with `;` and test `$?` / `$LASTEXITCODE`.
- `2>&1` on a native command wraps stderr in `ErrorRecord` objects and can flip `$?` to `$false` although the exit code was 0. Check `$LASTEXITCODE` instead.
- Quoting: arguments with spaces need quotes; `--%` stops parsing; `$` and backticks expand in double quotes — use single-quoted here-strings for literal text.
- Cmdlets that "don't error": non-terminating errors skip `catch` unless `-ErrorAction Stop`. `Remove-Item` and friends may prompt — pass `-Confirm:$false`.
- Paths: backslash vs slash in tools that expect POSIX, 260-char path limit, OneDrive/AV file locks ("file in use"), case-insensitive file system hiding case-only renames in git (`git mv`).
- Line endings: CRLF vs LF breaks shell scripts run in WSL/Git Bash (`\r: command not found`) and shows as whole-file diffs. Check `.gitattributes` / `core.autocrlf`.
- Execution policy blocks `.ps1` ("running scripts is disabled"): `Set-ExecutionPolicy -Scope Process Bypass` for a one-off, not machine-wide.
- Environment changes made with `$env:X = ...` last for that process only; `setx` affects new processes, not the current one.
