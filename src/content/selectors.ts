import type { Selectors } from '@/types';

export const SELECTORS: Selectors = {
  employeeCard: {
    primary: '[data-entity-urn*="company-employee"]',
    fallback: [
      '.org-people-profile-card',
      '[data-control-name="people_profile_card"]',
      'li.ember-view.org-people-profile-card__profile-card',
    ],
  },
  name: {
    primary: '.org-people-profile-card__profile-title',
    fallback: ['[aria-label*="View"]', 'a.app-aware-link', '.artdeco-entity-lockup__title'],
  },
  title: {
    primary: '.artdeco-entity-lockup__subtitle',
    fallback: [
      '.t-14.t-black--light',
      '.org-people-profile-card__profile-info',
      '.lt-line-clamp--single-line',
    ],
  },
  tenure: {
    primary: '.artdeco-entity-lockup__caption',
    fallback: ['.t-12.t-black--light', 'time', '.lt-line-clamp'],
  },
};

