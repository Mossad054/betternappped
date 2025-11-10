/**
 * Typography Constants
 * Standardized font sizes and weights across the app
 */

export const Typography = {
  // Font Sizes
  fontSize: {
    // Headers
    title: 28,        // Page titles
    heading: 24,      // Section headings
    subheading: 20,   // Sub-sections
    
    // Body Text
    large: 18,        // Large body text, card titles
    body: 16,         // Standard body text
    medium: 14,       // Medium text, descriptions
    small: 12,        // Small text, labels
    tiny: 11,         // Very small text, captions
    
    // Special
    display: 48,      // Large display numbers
    button: 16,       // Button text
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 20,
    normal: 24,
    relaxed: 28,
  },
};

export default Typography;
