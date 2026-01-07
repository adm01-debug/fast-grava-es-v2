// String manipulation utilities

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

// Truncate in the middle
export function truncateMiddle(text: string, maxLength: number, separator = '...'): string {
  if (text.length <= maxLength) return text;
  const charsToShow = maxLength - separator.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return text.slice(0, frontChars) + separator + text.slice(-backChars);
}

// Capitalize first letter
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Capitalize each word
export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Convert to title case
export function toTitleCase(text: string): string {
  const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];
  
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !smallWords.includes(word)) {
        return capitalize(word);
      }
      return word;
    })
    .join(' ');
}

// Convert to slug
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Convert to camelCase
export function toCamelCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

// Convert to snake_case
export function toSnakeCase(text: string): string {
  return text
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/[^a-z0-9]+/g, '_');
}

// Convert to kebab-case
export function toKebabCase(text: string): string {
  return text
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/[^a-z0-9]+/g, '-');
}

// Strip HTML tags
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// Escape HTML
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Unescape HTML
export function unescapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (entity) => map[entity]);
}

// Count words
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Count characters (excluding spaces)
export function countCharacters(text: string, includeSpaces = false): number {
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
}

// Highlight search term in text
export function highlightText(text: string, searchTerm: string, className = 'bg-yellow-200'): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
  return text.replace(regex, `<mark class="${className}">$1</mark>`);
}

// Escape regex special characters
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Generate initials from name
export function getInitials(name: string, maxInitials = 2): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .slice(0, maxInitials)
    .join('')
    .toUpperCase();
}

// Pluralize word (simple English)
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural || `${word}s`;
}

// Pluralize in Portuguese
export function pluralizePt(singular: string, plural: string, count: number): string {
  return count === 1 ? singular : plural;
}

// Format list with conjunction
export function formatList(items: string[], conjunction = 'e'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(` ${conjunction} `);
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(', ')} ${conjunction} ${lastItem}`;
}

// Remove accents/diacritics
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Check if string contains only letters
export function isAlpha(text: string): boolean {
  return /^[a-zA-ZÀ-ÿ]+$/.test(text);
}

// Check if string contains only numbers
export function isNumeric(text: string): boolean {
  return /^\d+$/.test(text);
}

// Check if string contains only alphanumeric
export function isAlphanumeric(text: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(text);
}

// Mask string (e.g., for sensitive data)
export function mask(text: string, visibleStart = 4, visibleEnd = 0, maskChar = '*'): string {
  if (text.length <= visibleStart + visibleEnd) return text;
  
  const start = text.slice(0, visibleStart);
  const end = visibleEnd > 0 ? text.slice(-visibleEnd) : '';
  const masked = maskChar.repeat(text.length - visibleStart - visibleEnd);
  
  return start + masked + end;
}

// Generate random string
export function randomString(length: number, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate UUID v4
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Levenshtein distance for fuzzy matching
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Similarity score (0-1)
export function similarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLength;
}
