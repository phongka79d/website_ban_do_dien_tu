# General
- No hardcoded secrets. Use environment variables (.env).
- Favor diffs/incremental updates over full file rewrites.
- Keep files small and focused. Split when a file exceeds ~200 lines.
- Handle errors explicitly. No silent catches.