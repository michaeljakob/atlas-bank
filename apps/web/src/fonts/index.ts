import localFont from 'next/font/local';

/**
 * Martina Plantijn — display serif for headings.
 */
export const fontHeading = localFont({
  src: [
    {
      path: './MartinaPlantijn-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
});

/**
 * RHPhonic — primary sans for body text.
 */
export const fontBody = localFont({
  src: [
    {
      path: './RHPhonic-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './RHPhonic-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
  preload: true,
  fallback: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
});
