---
description: This workflow is for Agent to follow
---

# Agent Workflow & Task Management

## Default Mode
- Enter plan mode for ANY non-trivial task (3+ steps or architecture changes).
- Trivial tasks (rename, small fix, one-liner) can execute directly.

## Task Management Flow
1. **Plan** - Break task into steps with checklist. Define expected outcomes.
2. **Spec** - Write detailed specs to remove ambiguity. If unclear, ask.
3. **Verify plan** - Review steps before execution. Check dependencies.
4. **Execute** - One step at a time. Explain changes at each step.
5. **Verify result** - Run tests, check logs, simulate real usage. Compare expected vs actual.
6. **Document** - Record what was done, what changed, and why.
7. **Capture lessons** - Log gotchas, edge cases, or surprises.

## If Something Breaks
- STOP execution immediately.
- Re-read error logs and trace the issue.
- Re-plan from the failure point.
- Do NOT continue with a broken state.

## Completion Criteria
- Never mark done without proofs.
- Ask: "Would a senior engineer approve this?"
- All tests pass, no regressions, behavior matches spec.