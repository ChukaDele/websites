# Registry patch — registering responsive-motion-systems for auto-load

## Claude Code (already active)

Claude Code auto-discovers any skill directory under `~/.claude/skills/`. The skill is installed at:

```
~/.claude/skills/responsive-motion-systems/SKILL.md
```

No further registration is needed — it was confirmed to surface in the available-skills list
immediately after the file was written. Auto-load is driven by the `description` and `triggers`
in the YAML frontmatter.

## Major (register only if its registry differs)

- Major's skill directory exists at `~/.major/skills/` (currently contains `internal/`).
- Major's canonical CLI is `$HOME/.local/bin/major` (a wrapper that execs
  `node /Users/chukwuka/Projects/project-baracks/dist/entry.js "$@"`).

If Major does not auto-discover from `~/.claude/skills/`, register it explicitly. First try the
CLI registrar:

```sh
"$HOME/.local/bin/major" skill register \
  --name responsive-motion-systems \
  --path "$HOME/.claude/skills/responsive-motion-systems/SKILL.md"
```

If that subcommand is not present, place a copy under Major's own tree and let it index on next
attach:

```sh
mkdir -p "$HOME/.major/skills/responsive-motion-systems"
cp "$HOME/.claude/skills/responsive-motion-systems/SKILL.md" \
   "$HOME/.major/skills/responsive-motion-systems/SKILL.md"
```

Verify discovery with `"$HOME/.local/bin/major" skill list` (or the equivalent registry query)
and confirm `responsive-motion-systems` appears. A file existing on disk is not proof the
resolver loaded it — verify on a later representative frontend task.

## Auto-load trigger list

The skill MUST auto-load whenever a frontend task mentions any of:

`scrollytelling`, `GSAP`, `ScrollTrigger`, `sticky`, `pin` / `pinning`, `pinned scene`,
`hero video`, `viewport animation`, `card stacking` / `card stack`, `scroll scrub` / `scrub`,
`parallax`, `Three.js`, `matchMedia`, `ResizeObserver`, `scroll runway`, `sticky scene`.

This list is the source of surfacing; it is duplicated in the `description` string and the
`triggers` array of `SKILL.md`. Keep all three in sync if the trigger set changes.
