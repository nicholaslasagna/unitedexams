const DISPLAY_NAME_MAX_LENGTH = 32;
const DISPLAY_NAME_MIN_LENGTH = 2;
const DISPLAY_NAME_PATTERN = /^[a-zA-Z0-9 ._'-]+$/;
const BLOCKED_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "dick",
  "cunt",
  "nigger",
  "faggot"
];

export function getDisplayNameMaxLength() {
  return DISPLAY_NAME_MAX_LENGTH;
}

export function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function validateDisplayName(value: string) {
  const normalized = normalizeDisplayName(value);

  if (normalized.length < DISPLAY_NAME_MIN_LENGTH) {
    return {
      valid: false,
      message: `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters.`
    };
  }

  if (normalized.length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      valid: false,
      message: `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`
    };
  }

  if (!DISPLAY_NAME_PATTERN.test(normalized)) {
    return {
      valid: false,
      message: "Display name can only include letters, numbers, spaces, and . _ ' -"
    };
  }

  const lower = normalized.toLowerCase();
  const hasBlockedWord = BLOCKED_WORDS.some((word) => lower.includes(word));
  if (hasBlockedWord) {
    return {
      valid: false,
      message: "Please choose a different display name."
    };
  }

  return { valid: true, message: null };
}

