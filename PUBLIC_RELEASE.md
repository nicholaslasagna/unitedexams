# Public Release Checklist

This repository is intended to be safe for public portfolio review after
the checklist below is satisfied.

## License Position

United Exams is source-available, not open source. The public license
allows review for portfolio, hiring, security, and business diligence,
but does not grant permission to deploy, resell, redistribute, or build
derivative products without written permission.

## What Must Never Be Committed

- `.env`, `.env.local`, `.env.production`, or any deployment export
- Supabase `.temp` metadata
- Stripe, Supabase, MailerSend, Cloudflare, GitHub, or database secrets
- production dumps, backups, or user exports
- proprietary fonts or paid design assets
- private security assessments or incident runbooks
- real student records, grades, support messages, or institution rosters

## Content Safety

Seed data should be treated as demo material. Before publishing new
course packs, verify that the material is original, licensed for public
distribution, or sufficiently transformed into independent practice
content. Do not commit instructor-provided slides, screenshots, Canvas
exports, paid textbook material, or identifiable student submissions.

## History Rewrite Required Before Public Flip

The current tree has removed tracked Supabase temp metadata and a
proprietary font. Because those files existed in prior commits, the git
history must be rewritten before the existing repository is made public.

Paths to purge from history:

- `supabase/.temp`
- `public/fonts/RodinBokutoh-Pro-B.otf`
- `.claude/launch.json`
- `SECURITY_OPERATIONS.md`
- `SECURITY_POSTURE.md`

After rewriting history, rotate any production secrets that may have
appeared in local deployment metadata, then force-push only after
confirming no collaborators depend on the old history.

## Required Verification

Run:

```bash
npm run public:audit
npm run typecheck
npm run build
```

Recommended before public release:

```bash
git log --all --pretty=format: --name-only | sort -u | rg -i '(^|/)(\\.env|.*secret.*|.*token.*|supabase/\\.temp|.*\\.otf$|.*\\.ttf$|.*\\.woff2?$)'
```

If any sensitive path still appears, do not make the repository public
until it is removed from both the current tree and git history.
