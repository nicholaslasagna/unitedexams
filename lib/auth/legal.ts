export const LEGAL_VERSION = "2026-03-04";

export function isLegalAcceptanceComplete(input: {
  privacyVersionAccepted?: string | null;
  termsVersionAccepted?: string | null;
}) {
  return (
    input.privacyVersionAccepted === LEGAL_VERSION &&
    input.termsVersionAccepted === LEGAL_VERSION
  );
}
