import type { Selectors } from '@/types';

export const SELECTORS: Selectors = {
  employeeCard: {
    primary: 'li.org-people-profile-card__profile-card-spacing',
    fallback: [
      'section.artdeco-card.full-width',
      '[class*="org-people-profile-card"]',
      'li.grid.block',
    ],
  },
  name: {
    primary: '.artdeco-entity-lockup__title a div.lt-line-clamp',
    fallback: [
      '.artdeco-entity-lockup__title a',
      '[aria-label*="View"]',
      '.artdeco-entity-lockup__title',
    ],
  },
  title: {
    primary: '.artdeco-entity-lockup__subtitle .t-14.t-black--light div.lt-line-clamp',
    fallback: [
      '.artdeco-entity-lockup__subtitle .t-14',
      '.artdeco-entity-lockup__subtitle',
      '[class*="subtitle"]',
    ],
  },
  tenure: {
    primary: '.artdeco-entity-lockup__caption',
    fallback: [
      '.t-12.t-black--light',
      'time',
      '.lt-line-clamp--multi-line',
    ],
  },
};

