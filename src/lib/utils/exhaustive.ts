/**
 * Enforce an exhaustive switch/branch at compile time.
 * Call with a value typed `never` in the default branch to get a type error
 * if any case was missed.
 */
export function assertUnreachable(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
