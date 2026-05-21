/**
 * Demo account for local design and development.
 * Override via .env: REACT_APP_DEMO_EMAIL, REACT_APP_DEMO_PASSWORD
 */
export const DEMO_EMAIL =
  process.env.REACT_APP_DEMO_EMAIL || 'demo@design.local';

export const DEMO_PASSWORD =
  process.env.REACT_APP_DEMO_PASSWORD || 'DesignDemo2024!';

export const isDemoLoginEnabled =
  process.env.REACT_APP_ENABLE_DEMO_LOGIN === 'true' ||
  process.env.NODE_ENV === 'development';

export const DEMO_SEED_DATA = {
  formData: {
    name: 'Alex Morgan',
    overview:
      'A lifelong storyteller who loves capturing family history. This demo account is pre-filled so you can explore the app while designing.',
    childhood:
      'Grew up in a small coastal town. Summer evenings on the pier, bicycle rides to the library, and Sunday dinners with grandparents shaped early years.',
    family:
      'Married in 1998. Two children and a close circle of friends who became family. Holidays are loud, joyful, and full of homemade recipes.',
    career:
      'Started as a teacher, moved into curriculum design, and later led community education programs. Proud of mentoring dozens of first-year educators.',
    achievements:
      'Published a local history booklet, completed a marathon at 50, and helped launch a neighborhood literacy program.',
    wisdom:
      'Write while the memory is warm. Small moments matter more than perfect sentences. Share stories often—they connect generations.',
    memories: [
      {
        id: 1,
        title: 'First day of school',
        content: 'Carried a red backpack twice my size and waved until the bus turned the corner.',
      },
      {
        id: 2,
        title: 'Family reunion 2010',
        content: 'Four generations in one backyard photo. Someone brought an old accordion; everyone sang.',
      },
    ],
    timeline: [
      { year: '1965', event: 'Born in Harborview', category: 'personal' },
      { year: '1983', event: 'Graduated high school', category: 'education' },
      { year: '1998', event: 'Married Jordan', category: 'family' },
      { year: '2005', event: 'Led community literacy program', category: 'career' },
      { year: '2018', event: 'Published local history booklet', category: 'career' },
    ],
  },
  photos: {},
  recordings: {},
  writingStreak: 3,
  lastWriteDate: new Date().toISOString().split('T')[0],
};
