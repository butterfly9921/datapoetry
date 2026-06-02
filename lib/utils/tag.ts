/**
 * Extract hashtags from content string.
 * Supports Chinese and English tags: #tag #标签
 */
export function extractTags(content: string): string[] {
  const regex = /#([\w\u4e00-\u9fff\u3400-\u4dbf]+)/g;
  const matches = Array.from(content.matchAll(regex));
  const tags = new Set<string>();
  for (const match of matches) {
    if (match[1]) {
      tags.add(match[1]);
    }
  }
  return Array.from(tags);
}

/**
 * Remove hashtag markers from content to get clean text.
 * Optionally replaces #tag with just tag or removes it entirely.
 */
export function stripTags(content: string): string {
  return content.replace(/#[\w\u4e00-\u9fff\u3400-\u4dbf]+/g, '').trim();
}

/**
 * Parse tags from an array of strings, removing '#' prefix if present.
 */
export function normalizeTags(tagNames: string[]): string[] {
  return tagNames
    .map(t => t.startsWith('#') ? t.slice(1) : t)
    .filter(t => t.length > 0)
    .filter((t, i, arr) => arr.indexOf(t) === i); // dedupe
}
