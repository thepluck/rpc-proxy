// Validates a keys file imported from secrets/ and returns its non-empty keys. `path` names the file
// in error messages.
export function parseApiKeys(file: unknown, path: string): string[] {
  if (!Array.isArray(file) || !file.every((key) => typeof key === "string")) {
    throw new Error(`${path} must be a JSON array of strings`);
  }

  const keys = file.map((key: string) => key.trim()).filter((key) => key.length > 0);

  if (keys.length === 0) {
    throw new Error(`${path} has no keys`);
  }

  return keys;
}
