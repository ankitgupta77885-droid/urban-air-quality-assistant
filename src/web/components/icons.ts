/**
 * Reusable inline SVG icons.
 *
 * All icons are marked aria-hidden="true" and created safely via createElementNS.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Creates an inline SVG element with standard stroke styling.
 * @param viewBox - SVG viewBox attribute string.
 * @param pathD - Path data string (or multiple path strings).
 * @param className - Optional CSS class name.
 * @returns Configured SVGSVGElement.
 */
export function createSvgIcon(
  viewBox: string,
  pathD: string | string[],
  className = 'icon',
): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('class', className);

  const paths = Array.isArray(pathD) ? pathD : [pathD];
  for (const d of paths) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }

  return svg;
}

/** Creates the header air / wind brand icon. */
export function createAirIcon(): SVGSVGElement {
  return createSvgIcon(
    '0 0 24 24',
    [
      'M9.59 4.59A2 2 0 1 1 11 8H2',
      'M12.59 19.41A2 2 0 1 0 14 16H2',
      'M15.73 7.73A2.5 2.5 0 1 1 18 12H2',
    ],
    'icon icon-air',
  );
}

/** Creates a location pin SVG icon. */
export function createLocationPinIcon(): SVGSVGElement {
  return createSvgIcon(
    '0 0 24 24',
    [
      'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z',
      'M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    ],
    'icon icon-pin',
  );
}

/** Creates a checkmark indicator SVG icon. */
export function createCheckIcon(): SVGSVGElement {
  return createSvgIcon('0 0 24 24', 'M20 6L9 17l-5-5', 'icon icon-check');
}

/** Creates a medical shield guidance SVG icon. */
export function createMedicalIcon(): SVGSVGElement {
  return createSvgIcon(
    '0 0 24 24',
    ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'M12 8v8', 'M8 12h8'],
    'icon icon-medical',
  );
}

/** Creates an AQI status indicator SVG icon. */
export function createAqiStatusIcon(category: string): SVGSVGElement {
  const norm = category.toLowerCase();
  if (norm.includes('good')) {
    return createSvgIcon('0 0 24 24', 'M20 6L9 17l-5-5', 'icon icon-status-good');
  }
  if (norm.includes('moderate')) {
    return createSvgIcon(
      '0 0 24 24',
      ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'M12 8v4', 'M12 16h.01'],
      'icon icon-status-moderate',
    );
  }
  return createSvgIcon(
    '0 0 24 24',
    [
      'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
      'M12 9v4',
      'M12 17h.01',
    ],
    'icon icon-status-alert',
  );
}

const DEFAULT_ICON_PATH: string[] = [
  'M12 3v3m0 12v3m9-9h-3M6 12H3',
  'M16.24 7.76l2.12-2.12M7.76 16.24l-2.12 2.12',
];

const ACTION_ICON_PATHS: Record<string, string | string[]> = {
  sun: ['M12 2v4', 'M12 18v4', 'M4.93 4.93l2.83 2.83', 'M16.24 16.24l2.83 2.83', 'M2 12h4', 'M18 12h4', 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  home: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  car: ['M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14', 'M3 21h18'],
  walk: ['M13 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M7 21l3-7 3 3v5', 'M14 9l-2-2-4 3v5'],
  leaf: ['M11 20A7 7 0 0 1 4 13C4 7 11 3 20 3c0 9-4 17-9 17z', 'M4 13c7 0 11-4 11-4'],
  wind: ['M9.59 4.59A2 2 0 1 1 11 8H2', 'M12.59 19.41A2 2 0 1 0 14 16H2', 'M15.73 7.73A2.5 2.5 0 1 1 18 12H2'],
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  sparkle: DEFAULT_ICON_PATH,
  alert: ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'],
};

const CATEGORY_MAP: Record<string, string> = {
  'morning-routine': 'sun',
  commute: 'car',
  'outdoor-activity': 'walk',
  'evening-routine': 'moon',
  'indoor-air-hack': 'home',
  'sustainable-alternative': 'leaf',
};

/** Creates an action icon from an allowed key enum, never emoji. */
export function createActionIcon(iconKey: string): SVGSVGElement {
  const norm = iconKey.toLowerCase().trim();
  const resolved = CATEGORY_MAP[norm] ?? norm;
  const path = ACTION_ICON_PATHS[resolved] ?? DEFAULT_ICON_PATH;
  return createSvgIcon('0 0 24 24', path, 'icon icon-action');
}

/** Creates an advice category SVG icon. */
export function createCategoryIcon(category: string): SVGSVGElement {
  const norm = category.toLowerCase().trim();
  const resolved = CATEGORY_MAP[norm] ?? norm;
  const path = ACTION_ICON_PATHS[resolved] ?? DEFAULT_ICON_PATH;
  return createSvgIcon('0 0 24 24', path, 'icon icon-category');
}
