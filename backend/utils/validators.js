/**
 * Reusable input-validation helpers.
 * Each function returns an error string or null if valid.
 */

/**
 * Ensure every key in `fields` exists and is non-empty on `body`.
 * @param {object} body   – parsed request body
 * @param {string[]} fields – required field names
 * @returns {string|null}  – error message or null
 */
function requireFields(body, fields) {
  for (const field of fields) {
    if (
      body[field] === undefined ||
      body[field] === null ||
      (typeof body[field] === "string" && body[field].trim() === "")
    ) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

/**
 * Validate that `value` is an integer between min and max (inclusive).
 */
function validateRating(value, min = 1, max = 5) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < min || num > max) {
    return `Rating must be an integer between ${min} and ${max}.`;
  }
  return null;
}

/**
 * Validate minimum string length.
 */
function validateMinLength(value, minLen, fieldName = "Field") {
  if (typeof value !== "string" || value.trim().length < minLen) {
    return `${fieldName} must be at least ${minLen} characters.`;
  }
  return null;
}

module.exports = { requireFields, validateRating, validateMinLength };
