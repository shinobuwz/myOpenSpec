# Lite Runs

`lite-runs/` stores factual records for `opsx-lite` executions.

A lite-run is a mini audit record for a small change. It is not a formal OpenSpec change and must not contain proposal/design/spec/tasks/gates.

## Layout

```
.aiknowledge/lite-runs/
└── YYYY-MM/
    └── YYYY-MM-DD-short-topic.md
```

## Source Ref

Knowledge entries may reference a lite-run as:

```yaml
source_refs:
  - lite-run:YYYY-MM-DD-short-topic
```

If a later commit exists, prefer adding both:

```yaml
source_refs:
  - lite-run:YYYY-MM-DD-short-topic
  - commit:<sha>
```

## Template

```md
---
id: YYYY-MM-DD-short-topic
created_at: YYYY-MM-DDTHH:MM:SSZ
kind: lite
status: done
source_refs:
---

# <short-topic>

## Intent

Why this small change was made.

## Scope

Files changed.

## Changes

What actually changed.

## Verification

Commands run and results.

## Risks

Residual risks or unverified items.

## Knowledge

Whether anything was captured into `.aiknowledge/pitfalls` or `.aiknowledge/codemap`.
```

## Rules

- Keep lite-runs factual and concise.
- Do not duplicate full diffs unless needed for understanding.
- Do not use lite-runs for new features, multi-module changes, or design-heavy work.
- If a lite-run uncovers reusable knowledge, create or update the relevant pitfall/codemap entry and reference the lite-run.
