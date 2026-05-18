# Security Policy

## Supported Project

United Exams is maintained as a production SaaS project. This public
repository is source-available for portfolio and technical review; it is
not a turnkey self-hosting package.

## Reporting a Vulnerability

Report suspected vulnerabilities privately to:

- support@unitedexams.com

Please include:

- affected route, API endpoint, or database object;
- a clear reproduction path;
- impact assessment;
- whether any account, grade, payment, or personal data may be affected.

Do not publicly disclose vulnerabilities until they have been reviewed
and remediated.

## Testing Boundaries

Do not run destructive, high-volume, or privacy-invasive testing against
production systems without written authorization. This includes:

- credential stuffing;
- denial-of-service testing;
- spam, scraping, or bulk account creation;
- attempts to access another user&apos;s data;
- payment abuse or charge testing outside provider test modes.

## Secret Handling

Production secrets are not committed to this repository. Required
environment variable names are documented in `.env.example`; real values
must be stored in the deployment platform or local untracked `.env`
files.

If a secret is ever committed, rotate it immediately and purge the value
from git history before making or keeping the repository public.
