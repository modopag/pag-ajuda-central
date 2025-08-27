import DOMPurify from 'dompurify';

// Configure DOMPurify for safe HTML rendering
const createPurifyConfig = () => {
  // Allow common HTML tags and attributes for article content
  const allowedTags = [
    'p', 'div', 'span', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'mark',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'small', 'sub', 'sup',
  ];

  return {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'loading', 'cite', 'class', 'id'],
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ['target', 'loading'],
    FORBID_CONTENTS: ['script', 'style'],
  };
};

const purifyConfig = createPurifyConfig();

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html Raw HTML string
 * @returns Sanitized HTML safe for rendering
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Only run DOMPurify in browser environment
  if (typeof window === 'undefined') {
    return html; // Return as-is in SSR, assuming server-side content is trusted
  }

  return DOMPurify.sanitize(html, purifyConfig);
};

/**
 * Strips all HTML tags and returns plain text
 * @param html HTML string
 * @returns Plain text without HTML tags
 */
export const stripHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  if (typeof window === 'undefined') {
    // Simple regex-based stripping for SSR
    return html.replace(/<[^>]*>/g, '');
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Creates a safe excerpt from HTML content
 * @param html HTML string
 * @param maxLength Maximum length of excerpt
 * @returns Safe plain text excerpt
 */
export const createSafeExcerpt = (html: string, maxLength: number = 160): string => {
  const plainText = stripHtml(html);
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Find the last complete word within the limit
  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};