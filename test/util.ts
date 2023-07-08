let keyCount = 0;
export function getUniqueTestKey() {
  return `testKey${keyCount++}`;
}
