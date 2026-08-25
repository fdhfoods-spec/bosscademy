/**
 * Curated Unsplash photography: bright, modern workspaces (swap URLs anytime).
 * https://unsplash.com/license
 */
export const siteImages = {
  /**
   * Hero: group learning (no single stock portrait). Unsplash License: free for commercial use.
   * @see https://unsplash.com/license
   */
  hero: {
    src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=960&q=85&auto=format&fit=crop',
    alt: 'Learners working together with laptops in a bright, modern study space',
  },
  courses: {
    office: {
      src: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85&auto=format&fit=crop',
      alt: 'Laptop on a clean desk in a professional office environment',
    },
    data: {
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=85&auto=format&fit=crop',
      alt: 'Analytics dashboard and charts on a laptop screen',
    },
    marketing: {
      src: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&q=85&auto=format&fit=crop',
      alt: 'Person using laptop and smartphone for digital work',
    },
  },
  whyMentor: {
    /** Verified 200 OK; previous photo ID returned 404 from Unsplash */
    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=85&auto=format&fit=crop',
    alt: 'Team learning together with a mentor in a modern workspace',
  },
  /** Approachable professional portrait (Unsplash License). Verified 200 OK; swap with your own photo anytime. */
  teamGuide: {
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=560&q=85&auto=format&fit=crop',
    alt: 'Professional representing our learning team',
  },
} as const
