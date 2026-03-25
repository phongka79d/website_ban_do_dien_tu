---
description: This worksflow is for Bug-Fixing
---

# Bug Fixing Workflow

## Mindset
- Fix bugs immediately. No hand-holding, no asking obvious questions.
- Solve root cause, not symptoms.
- No hacky or temporary fixes unless explicitly approved and marked with TODO.

## Process
1. **Reproduce** - Confirm the bug. Get exact error, logs, stack trace.
2. **Isolate** - Narrow down to the smallest failing unit.
3. **Trace** - Read logs, errors, failing tests. Follow the data flow.
4. **Root cause** - Identify WHY it fails, not just WHERE.
5. **Fix** - Minimal, clean fix. Avoid side effects.
6. **Verify** - Run related tests. Check edge cases. Confirm no regressions.
7. **Log** - If the bug was non-obvious, add to `gotchas.md`.

## CI Failures
- Fix CI failures proactively. Don't wait for user to notice.
- Check build logs, lint errors, test failures in order.
- Environment-specific issues (paths, OS, versions) are common. Check first.

## Red Flags (re-plan if you see these)
- Same bug reappearing after fix.
- Fix requires changing 5+ unrelated files.
- You don't understand why the fix works.