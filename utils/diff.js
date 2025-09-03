export function printDiff(original, sanitized) {
  const diff = {};
  for (const key in sanitized) {
    if (
      typeof sanitized[key] === "object" &&
      sanitized[key] !== null &&
      original[key]
    ) {
      const nested = printDiff(original[key], sanitized[key]);
      if (Object.keys(nested).length > 0) diff[key] = nested;
    } else if (sanitized[key] !== original[key]) {
      diff[key] = { original: original[key], sanitized: sanitized[key] };
    }
  }
  for (const key in original) {
    if (!(key in sanitized)) {
      diff[key] = { original: original[key], sanitized: undefined };
    }
  }
  return diff;
}

export function prettyPrintDiff(diff, prefix = "") {
  for (const key in diff) {
    if (typeof diff[key] === "object" && "original" in diff[key]) {
      console.log(
        `${prefix}${key}:\n  original: ${JSON.stringify(
          diff[key].original
        )}\n  sanitized: ${JSON.stringify(diff[key].sanitized)}`
      );
    } else {
      prettyPrintDiff(diff[key], prefix + key + ".");
    }
  }
}
