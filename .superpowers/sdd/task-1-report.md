# Task 1 Report: Shared parseBibleReference Utility

**Status:** DONE

**Commits:**
- `bb752ea` — feat: add shared parseBibleReference utility

**Verification:**
- `npx tsc --noEmit` — no type errors (clean exit)

**Concerns:**
- The brief's regex pattern contained mojibake characters (`â€“` from UTF-8 bytes E2 80 93 being the en-dash `–`). Wrote a working character class `[-–]` instead.
