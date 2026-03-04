const DISPLAY_NAME_MAX_LENGTH = 16;
const DISPLAY_NAME_MIN_LENGTH = 2;
const DISPLAY_NAME_PATTERN = /^[a-zA-Z0-9 ._'-]+$/;
const REAL_NAME_MAX_LENGTH = 32;
const REAL_NAME_PATTERN = /^[a-zA-Z ._'-]+$/;

const BLOCKED_WORDS = [
  "fuck",
  "fucker",
  "fucking",
  "motherfucker",
  "motherfucking",
  "shit",
  "shitty",
  "bullshit",
  "dipshit",
  "asshole",
  "jackass",
  "dumbass",
  "badass",
  "bastard",
  "bitch",
  "bitches",
  "sonofabitch",
  "cunt",
  "dick",
  "dickhead",
  "cock",
  "cocksucker",
  "prick",
  "twat",
  "wanker",
  "slut",
  "whore",
  "skank",
  "pussy",
  "faggot",
  "retard",
  "retarded",
  "nigger",
  "nigga",
  "chink",
  "spic",
  "kike",
  "gook",
  "wetback",
  "raghead",
  "tranny",
  "shemale",
  "rapist",
  "pedophile",
  "incest",
  "bestiality",
  "blowjob",
  "handjob",
  "cumshot",
  "porn",
  "pornhub",
  "xvideos",
  "xnxx",
  "onlyfans",
  "hentai",
  "suicide",
  "nazis",
  "terrorist"
];

const BLOCKED_PHRASES = [
  "kill all",
  "die bitch",
  "self harm",
  "heil hitler",
  "son of a bitch",
  "go kill yourself"
];

function normalizeForModeration(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[@]/g, "a")
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7+]/g, "t")
    .replace(/[8]/g, "b")
    .replace(/[9]/g, "g")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getDisplayNameMaxLength() {
  return DISPLAY_NAME_MAX_LENGTH;
}

export function getRealNameMaxLength() {
  return REAL_NAME_MAX_LENGTH;
}

export function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeRealName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function hasBlockedWord(value: string) {
  const normalized = normalizeForModeration(value);
  if (!normalized) return false;

  const tokens = normalized.split(" ");
  if (tokens.some((token) => BLOCKED_WORDS.includes(token))) {
    return true;
  }

  const padded = ` ${normalized} `;
  return BLOCKED_PHRASES.some((phrase) => padded.includes(` ${phrase} `));
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

  if (hasBlockedWord(normalized)) {
    return {
      valid: false,
      message: "Please choose a different display name."
    };
  }

  return { valid: true, message: null };
}

export function validateRealName(value: string) {
  const normalized = normalizeRealName(value);

  if (!normalized) return { valid: true, message: null };

  if (normalized.length > REAL_NAME_MAX_LENGTH) {
    return {
      valid: false,
      message: `Name must be ${REAL_NAME_MAX_LENGTH} characters or fewer.`
    };
  }

  if (!REAL_NAME_PATTERN.test(normalized)) {
    return {
      valid: false,
      message: "Name can only include letters, spaces, and . _ ' -"
    };
  }

  if (hasBlockedWord(normalized)) {
    return {
      valid: false,
      message: "Please use a different name."
    };
  }

  return { valid: true, message: null };
}
