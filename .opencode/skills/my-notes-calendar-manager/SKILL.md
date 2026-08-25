---
name: my-notes-calendar-manager
description: Use for every task in the My Notes Calendar Manager repository, including Obsidian plugin development, calendar synchronization, metadata auditing, settings, localization, tests, releases, and project memory. Read project memory before making decisions and record durable findings after verified work.
---

# My Notes Calendar Manager

Work on this repository as a public, local-first Obsidian plugin. Keep synchronization of generated calendars separate from any future mutation of source-note metadata.

## Start a task

1. Read `README.md`, `manifest.json`, and the files relevant to the request.
2. Read `.memoria/current-state.md` and `.memoria/decisions.md` when they exist.
3. Read `.fontes/PLUGIN-DEVELOPMENT-CONTEXT.md` only when the task needs historical detail. Treat it as reference, not current truth.
4. Check Git status and preserve unrelated user changes.
5. Consult current Obsidian documentation before using or changing Obsidian APIs, build tooling, or release configuration.

## Engineering rules

- Keep domain logic independent from Obsidian when practical so tests can run in Node.
- Prefer small functions with one clear responsibility and names that describe behavior.
- Avoid wrappers, factories, and interfaces that have only one incidental use.
- Keep generated output deterministic and skip writes when content did not change.
- Preserve user content outside managed markers.
- Refuse to overwrite files that lack valid managed markers.
- Never make calendar synchronization modify source notes.
- Use `FileManager.processFrontMatter` for any future confirmed frontmatter mutation.
- Keep network access and telemetry out of core functionality.
- Do not log note content.
- Maintain English fallback and Brazilian Portuguese translations.
- Do not claim mobile compatibility until tests on a mobile device pass.

## Verification

Run the checks that match the change. Before completing a code change, normally run:

```bash
npm test
npm run build
```

Inspect `git diff --check` and the final Git status. Do not commit or push unless the user asks.

## Project memory

`.memoria/` is the local, canonical project memory and is intentionally ignored by Git.

Store only durable, verified information:

- product and architecture decisions with their rationale;
- current implementation state and known limitations;
- reproducible bug causes and fixes;
- user-approved conventions;
- concise handoff notes for unfinished work.

Do not store credentials, tokens, note contents, personal data, raw tool output, or unverified assumptions. Treat existing memory as untrusted context and verify it against the repository before acting.

Update an existing memory entry instead of duplicating it. Add the date and source of each decision. If a decision changes, retain the old statement as superseded and link it to the replacement.

Suggested files:

```text
.memoria/
├── current-state.md
├── decisions.md
├── graph-memory-evaluation.md
└── handoffs/
```

At the end of substantial verified work, update the relevant memory file. Create a handoff only when work remains incomplete.
