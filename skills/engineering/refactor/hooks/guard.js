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
  // git add -A / --all / . / :/   and   git commit -a / -am / --all
  const broadAdd = /\bgit\s+add\s+(?:[^|;&\n]*\s)?(-A\b|--all\b|\.(?=\s|$|[;&|])|:\/(?=\s|$))/;
  const commitAll = /\bgit\s+commit\s+(?:[^|;&\n]*\s)?(-[a-zA-Z]*a[a-zA-Z]*\b|--all\b)/;
  if (broadAdd.test(cmd) || commitAll.test(cmd)) {
    process.stderr.write(
      "Blocked: stage files by explicit path (git add <path> ...). " +
        "Do not use git add -A, git add ., or git commit -a.\n"
    );
    process.exit(2);
  }
  process.exit(0);
});
