// PreToolUse hook: block broad git staging. Exit 2 = block, message on stderr.
// Reads the hook payload (JSON) from stdin; the Bash/PowerShell command is tool_input.command.
let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let cmd = "";
  try {
    cmd = (JSON.parse(raw).tool_input || {}).command || "";
  } catch {
    process.exit(0); // unreadable payload: do not block unrelated work
  }
  // Drop text that is data, not syntax: heredoc bodies, PowerShell here-strings, quoted strings.
  // Otherwise a commit message that merely mentions "git add -A" would be blocked.
  const code = cmd
    .replace(/<<-?\s*(['"]?)(\w+)\1[\s\S]*?\n\s*\2\b/g, " ")
    .replace(/@'[\s\S]*?'@|@"[\s\S]*?"@/g, " ")
    .replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, " ");
  // git [-C path | -c k=v | --opt]* add|commit ...
  const git = String.raw`\bgit(?:\s+(?:-C\s+\S+|-c\s+\S+|--[\w-]+(?:=\S+)?))*\s+`;
  const broadAdd = new RegExp(
    git + String.raw`add\s+(?:[^|;&\n]*\s)?(?:-A\b|--all\b|\.(?=\s|$|[;&|])|:\/(?=\s|$))`
  );
  const commitAll = new RegExp(
    git + String.raw`commit\s+(?:[^|;&\n]*\s)?(?:-[a-zA-Z]*a[a-zA-Z]*\b|--all\b)`
  );
  if (broadAdd.test(code) || commitAll.test(code)) {
    process.stderr.write(
      "Blocked: stage files by explicit path (git add <path> ...). " +
        "Do not use git add -A, git add ., or git commit -a.\n"
    );
    process.exit(2);
  }
  process.exit(0);
});
