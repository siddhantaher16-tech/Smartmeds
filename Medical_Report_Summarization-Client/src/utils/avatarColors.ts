/**
 * Generates a deterministic background color and contrasting font color
 * from a person's full name. The same name always produces the same color.
 */

const PALETTE = [
  { bg: "#EDE9FE", text: "#5B21B6" }, // violet
  { bg: "#FCE7F3", text: "#9D174D" }, // pink
  { bg: "#FEF3C7", text: "#92400E" }, // amber
  { bg: "#D1FAE5", text: "#065F46" }, // emerald
  { bg: "#DBEAFE", text: "#1E40AF" }, // blue
  { bg: "#FEE2E2", text: "#991B1B" }, // red
  { bg: "#E0F2FE", text: "#075985" }, // sky
  { bg: "#F3E8FF", text: "#6B21A8" }, // purple
  { bg: "#ECFCCB", text: "#3F6212" }, // lime
  { bg: "#FFEDD5", text: "#9A3412" }, // orange
  { bg: "#CFFAFE", text: "#164E63" }, // cyan
  { bg: "#FDF2F8", text: "#831843" }, // fuchsia
];

/** Returns a stable index into PALETTE based on the string's characters. */
function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % PALETTE.length;
}

/** Returns { bg, text } CSS color strings derived from the given full name. */
export function getAvatarColors(fullName: string): { bg: string; text: string } {
  const normalized = (fullName || "").trim();
  if (!normalized) return { bg: "#E2E8F0", text: "#64748B" }; // slate fallback
  return PALETTE[hashName(normalized)];
}

/** Returns the initials (up to 2 letters) for a full name. */
export function getInitials(fullName: string): string {
  const parts = (fullName || "").trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
