# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.
Commands

<!-- Fill in the real commands for this repo. This is the highest-value section — be exact. -->

Install deps: <e.g. npm install / pip install -r requirements.txt>
Run tests (full): <command>
Run tests (single file/case): <command> — prefer this over the full suite while iterating
Build: <command>
Lint/format: <command> — do not hand-write style fixes a formatter already enforces
Typecheck: <command>
Dev server: <command>


Before writing code


Read the file you're editing and any function/class you're calling before using it. Don't write against a remembered API — verify the real signature in this repo or in the installed dependency source.
Check the actual installed version of a library (lockfile, pip show, npm list, etc.) before relying on version-specific behavior. Don't assume the latest docs match what's installed.
If a needed API, config key, or CLI flag can't be confirmed to exist, say so explicitly instead of guessing plausibly.
If a requirement is ambiguous, state your assumption out loud rather than silently picking one.


After writing code


Run the relevant test(s) and the typecheck/lint command before saying a task is done.
Don't report something as "done" or "fixed" unless it's been run and verified. "Implemented X" and "implemented X, ran tests, passing" are different claims — don't blur them.
When fixing a bug, reproduce it first (run it, read the actual error) rather than fixing from the description alone.
Don't delete, skip, or weaken a failing test to get to green. Fix the cause or report the failure.


Scope


Don't refactor, rename, or touch unrelated code without flagging it first.
Match existing patterns and conventions in the file/module you're editing over introducing a new style.
Prefer the smallest diff that correctly solves the problem unless a rewrite was explicitly requested.


Architecture

<!-- The why that isn't visible in the code itself. Keep to things Claude can't infer. -->

<e.g. "Service layer never imports from controllers/ — see ADR-003">
<e.g. "We use server components by default; 'use client' only when state/effects are required">


Known footguns

<!-- Anything your team has been burned by. One line, with the reason — reasons make rules generalize. -->

<e.g. "Don't use library X's default retry — it double-submits on timeout, caused incident #142">

## UI Design
 Always follow the UI design system when creating or reveiwing components or pages
 Design system @Designs.md