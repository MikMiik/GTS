export const safeJSON = <T,>(value?: string | null): T | null => {
  if (!value || typeof value !== "string") return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const splitLines = (value?: string | null) =>
  (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
