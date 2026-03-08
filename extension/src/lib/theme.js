/**
 * Theme tokens — single source of truth for the pastel peachy palette.
 * These are mirrored in tailwind.config.js as CSS custom properties
 * so both Tailwind classes and Recharts/JS can use the same values.
 */
export const colors = {
  peach: {
    50: '#FFF8F5',
    100: '#FFE9DC',
    200: '#FFD9C0', // primary brand
    300: '#FFC9A3',
    400: '#FFB387',
    500: '#FF9D6B',
    600: '#F07840',
  },
  mint: '#D4F0E6',
  lavender: '#E8DFF5',
  cream: '#FFF9F0',
  rose: '#FFE0E6',
  sky: '#DFF0FF',

  // Semantic
  text: {
    primary: '#3D2B1F',
    secondary: '#7A5C4F',
    muted: '#B09A90',
  },
  surface: {
    base: '#FFFAF7',
    card: '#FFFFFF',
    hover: '#FFF0E8',
  },
  border: '#F0DDD4',
}

/**
 * 7 mood colors from very unpleasant (1) to very pleasant (7).
 * Used in charts and mood buttons.
 */
export const moodColors = [
  '#E8A0A0', // 1 - very unpleasant (muted red)
  '#F0BCA0', // 2 - unpleasant (terracotta)
  '#F0D9A0', // 3 - slightly unpleasant (warm amber)
  '#C8D8A0', // 4 - neutral (sage)
  '#A0D8B8', // 5 - slightly pleasant (mint)
  '#A0C8F0', // 6 - pleasant (sky)
  '#C4A0E8', // 7 - very pleasant (lavender)
]

/**
 * Mood labels matching the 1-7 scale (index 0 = mood 1).
 */
export const moodLabels = [
  'Very Unpleasant',
  'Unpleasant',
  'Slightly Unpleasant',
  'Neutral',
  'Slightly Pleasant',
  'Pleasant',
  'Very Pleasant',
]

/**
 * Mood emojis for quick visual recognition.
 */
export const moodEmojis = ['😣', '😟', '😕', '😐', '🙂', '😊', '😄']

/**
 * Chart color palette — for multiple series in Recharts.
 */
export const chartColors = [
  colors.peach[400],
  '#A0C8F0',
  '#A0D8B8',
  '#C4A0E8',
  '#F0D9A0',
  '#F0BCA0',
]
