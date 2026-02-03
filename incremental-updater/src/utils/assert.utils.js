export function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function assertNonNullable(value, message) {
  assert(
    value !== undefined && value !== null && value !== '',
    message ?? 'Value must not be null or undefined'
  );
}
