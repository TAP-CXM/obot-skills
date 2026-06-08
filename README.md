# Team Skills Repository

This repository is structured to work as an Obot skill source.

## Layout

Each skill lives in its own directory under `skills/` and must contain a `SKILL.md` file.

Example:

```text
skills/
  braze-api-workflows/
    SKILL.md
    references/
    scripts/
    examples/
    tests/
```

## Obot Setup

In Obot, add this GitHub repository as a skill source:

1. Go to `Obot Agent Management -> Skills -> Sources`
2. Click `Add Source URL`
3. Paste the repository HTTPS URL
4. Save and sync

Obot will scan the repository for every directory containing `SKILL.md` and index each skill it finds.

## Conventions

- Use lowercase, hyphenated directory names
- Keep reusable helper files inside the skill directory
- Put skill metadata in YAML frontmatter at the top of `SKILL.md`
- Treat Git as the source of truth; Obot indexes skills but does not edit them
