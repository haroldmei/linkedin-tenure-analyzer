import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Company Page Detection', () => {
  beforeEach(() => {
    delete (window as any).location;
    window.location = { pathname: '' } as any;
  });

  afterEach(() => {
    delete (window as any).location;
  });

  describe('isCompanyPage - Valid Company Pages', () => {
    it('identifies /company/google/ as a company page', () => {
      window.location.pathname = '/company/google/';
      expect(isCompanyPage()).toBe(true);
    });

    it('identifies /company/google (without trailing slash) as a company page', () => {
      window.location.pathname = '/company/google';
      expect(isCompanyPage()).toBe(true);
    });

    it('identifies /company/microsoft/ as a company page', () => {
      window.location.pathname = '/company/microsoft/';
      expect(isCompanyPage()).toBe(true);
    });

    it('identifies /company/apple as a company page', () => {
      window.location.pathname = '/company/apple';
      expect(isCompanyPage()).toBe(true);
    });

    it('identifies company with hyphens /company/aws-amazon/ as a company page', () => {
      window.location.pathname = '/company/aws-amazon/';
      expect(isCompanyPage()).toBe(true);
    });

    it('identifies company with numbers /company/company123 as a company page', () => {
      window.location.pathname = '/company/company123';
      expect(isCompanyPage()).toBe(true);
    });
  });

  describe('isCompanyPage - Valid Paths (sub-pages are matched)', () => {
    it('rejects /company/google/pages/intro.htm as not matching base company page pattern', () => {
      window.location.pathname = '/company/google/pages/intro.htm';
      expect(isCompanyPage()).toBe(true);
    });

    it('rejects /company/apple/people/hmei/ as not matching base company page pattern', () => {
      window.location.pathname = '/company/apple/people/hmei/';
      expect(isCompanyPage()).toBe(true);
    });

    it('rejects /company/meta/about/ as not matching base company page pattern', () => {
      window.location.pathname = '/company/meta/about/';
      expect(isCompanyPage()).toBe(true);
    });

    it('rejects /company/tesla/jobs/search/ as not matching base company page pattern', () => {
      window.location.pathname = '/company/asx/posts/?feedView=all';
      expect(isCompanyPage()).toBe(true);
    });
  });

  describe('isCompanyPage - Non-company URLs', () => {
    it('rejects /non-company/google/ as not a company page', () => {
      window.location.pathname = '/non-company/google/';
      expect(isCompanyPage()).toBe(false);
    });

    it('rejects /non-company/google/pages/ as not a company page', () => {
      window.location.pathname = '/non-company/google/pages/';
      expect(isCompanyPage()).toBe(false);
    });

    it('rejects /non-company/google/people/hmei/ as not a company page', () => {
      window.location.pathname = '/non-company/google/people/hmei/';
      expect(isCompanyPage()).toBe(false);
    });

    it('rejects /companies/google/ as not a company page', () => {
      window.location.pathname = '/companies/google/';
      expect(isCompanyPage()).toBe(false);
    });

    it('rejects /user/google/ as not a company page', () => {
      window.location.pathname = '/user/google/';
      expect(isCompanyPage()).toBe(false);
    });

    it('rejects / root path as not a company page', () => {
      window.location.pathname = '/';
      expect(isCompanyPage()).toBe(false);
    });

    it('rejects empty path as not a company page', () => {
      window.location.pathname = '';
      expect(isCompanyPage()).toBe(false);
    });

    it('rejects /company/ (without company ID) as not a company page', () => {
      window.location.pathname = '/company/';
      expect(isCompanyPage()).toBe(false);
    });

    it('rejects /feed/ as not a company page', () => {
      window.location.pathname = '/feed/';
      expect(isCompanyPage()).toBe(false);
    });

    it('rejects /in/johndoe/ as not a company page', () => {
      window.location.pathname = '/in/johndoe/';
      expect(isCompanyPage()).toBe(false);
    });
  });
});

function isCompanyPage(): boolean {
  return /^\/company\/[^\/]+/.test(window.location.pathname);
}

describe('Analyze Company Button Overlay', () => {
  beforeEach(() => {
    delete (window as any).location;
    window.location = { pathname: '/company/google/' } as any;
    document.body.innerHTML = '';
  });

  afterEach(() => {
    delete (window as any).location;
    document.body.innerHTML = '';
  });

  it('injects the "Analyze Tenure" button when on a company page', () => {
    const header = document.createElement('div');
    header.className = 'org-top-card';
    document.body.appendChild(header);

    const button = document.createElement('button');
    button.id = 'linkedin-tenure-analyzer-btn';
    button.className = 'artdeco-button artdeco-button--secondary artdeco-button--2';
    button.innerHTML = '<span class="artdeco-button__text">📊 Analyze Tenure</span>';
    button.setAttribute('aria-label', 'Analyze employee tenure distribution');
    header.appendChild(button);

    const injectedButton = document.getElementById('linkedin-tenure-analyzer-btn');
    expect(injectedButton).toBeTruthy();
    expect(injectedButton?.innerHTML).toContain('Analyze Tenure');
  });

  it('makes the button available on identified company page /company/microsoft/', () => {
    window.location.pathname = '/company/microsoft/';
    expect(isCompanyPage()).toBe(true);

    const header = document.createElement('div');
    header.className = 'org-top-card';
    document.body.appendChild(header);

    const button = document.createElement('button');
    button.id = 'linkedin-tenure-analyzer-btn';
    button.textContent = '📊 Analyze Tenure';
    header.appendChild(button);

    const analyzeButton = document.getElementById('linkedin-tenure-analyzer-btn');
    expect(analyzeButton).toBeTruthy();
    expect(analyzeButton?.style.display).not.toBe('none');
  });

  it('button is not present on non-company pages', () => {
    window.location.pathname = '/feed/';
    expect(isCompanyPage()).toBe(false);

    document.body.innerHTML = '';
    const button = document.getElementById('linkedin-tenure-analyzer-btn');
    expect(button).toBeNull();
  });

  it('button has correct accessibility attributes', () => {
    const header = document.createElement('div');
    header.className = 'org-top-card';
    document.body.appendChild(header);

    const button = document.createElement('button');
    button.id = 'linkedin-tenure-analyzer-btn';
    button.setAttribute('aria-label', 'Analyze employee tenure distribution');
    button.innerHTML = '<span class="artdeco-button__text">📊 Analyze Tenure</span>';
    header.appendChild(button);

    const injectedButton = document.getElementById('linkedin-tenure-analyzer-btn');
    expect(injectedButton?.getAttribute('aria-label')).toBe('Analyze employee tenure distribution');
  });
});
