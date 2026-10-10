/**
 * Formatting helpers for the workspace views. Dates are shown in UTC, as the laboratories record them.
 */

/** Locales of the supported languages, used by Intl. */
const locales = { en: 'en-US', es: 'es-419' };

/**
 * Formats a number with the separators of the language.
 * @param {number} value - Number to format.
 * @param {string} language - Language of the interface (en or es).
 * @returns {string} The formatted number.
 */
export const formatNumber = (value, language) => new Intl.NumberFormat(locales[language] ?? language).format(value ?? 0);

/**
 * Formats a date and time as "Apr 14, 09:30" in UTC.
 * @param {string} value - Date in ISO 8601.
 * @param {string} language - Language of the interface (en or es).
 * @returns {string} The formatted date, or an empty string when there is no date.
 */
export const formatDateTime = (value, language) => value
    ? new Intl.DateTimeFormat(locales[language] ?? language, {
        month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
    }).format(new Date(value))
    : '';

/**
 * Formats a date as "Apr 14, 2026" in UTC.
 * @param {string} value - Date in ISO 8601.
 * @param {string} language - Language of the interface (en or es).
 * @returns {string} The formatted date, or an empty string when there is no date.
 */
export const formatDate = (value, language) => value
    ? new Intl.DateTimeFormat(locales[language] ?? language, {month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC'})
        .format(new Date(value))
    : '';
