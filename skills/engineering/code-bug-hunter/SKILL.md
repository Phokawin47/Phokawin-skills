---
name: code-bug-hunter
description: Analyze code to find syntax and logic errors, summarize causes, and propose fixed code. Tailored for MongoDB, Google Cloud, and Data Analysis workflows. Use when the user asks to review code, find bugs, or fix errors — including phrasings like "why does this crash", "this throws an error", "check my code", "something is wrong with this query", or a pasted stack trace with code.
---

# Code Bug Hunter

A skill to thoroughly analyze code snippets for syntax errors, logical flaws, and potential runtime issues, providing clear explanations and corrected code.

## When to Use

- The user asks to find a bug in their code.
- The user provides an error message and code to fix.
- The user requests a code review for best practices.

## Steps

1. **Analyze the Code:** Review the provided code for syntax errors, logical flaws, and anti-patterns.
2. **Check Specific Domains:** Pay special attention to common pitfalls if the code involves:
   - **MongoDB Atlas:** Connection issues, query performance, index usage.
   - **Google Cloud:** Environment variables, permission configurations, specific service limits (e.g., Cloud Run).
   - **Data Analysis:** Pandas/NumPy logic errors, data type mismatches, off-by-one errors.
3. **Summarize the Issue:** Briefly explain the root cause of the bug in simple, concise terms.
4. **Provide the Fix:** Output the corrected code. Add inline comments explaining the changes made.
5. **Additional Recommendations:** (Optional) Suggest one or two brief tips to prevent similar bugs in the future or improve performance.

## Gotchas

- Do not rewrite the entire logic if only a small fix is needed; preserve the user's original intent.
- Ensure the corrected code is syntactically valid and properly indented.
- If the bug cannot be determined from the snippet, ask clarifying questions about the environment, inputs, or expected output.
