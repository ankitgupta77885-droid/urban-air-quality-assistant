/** BreatheWell brand logo mark component. */
const SVG_NS = 'http://www.w3.org/2000/svg';
type PathDef = [d: string, fill: string, stroke: string, width: string];

const PATHS: readonly PathDef[] = [
  ['M19 43C14 27 27 14 49 15c1 21-10 32-30 28z', '#F9F9F7', '', ''],
  ['M19 43l-6 6', 'none', '#F9F9F7', '4'],
  ['M22 40c6-3 9-8 13-12s8-6 11-10', 'none', 'currentColor', '3.5'],
  ['M30 51h14M36 45h10', 'none', '#7FD1B0', '4'],
];

/** Creates the 32x32 inline SVG brand logo mark. */
export function createLogo(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('width', '32');
  svg.setAttribute('height', '32');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'brand-logo');

  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('cx', '32');
  circle.setAttribute('cy', '32');
  circle.setAttribute('r', '32');
  circle.setAttribute('fill', 'currentColor');
  svg.appendChild(circle);

  for (const [d, fill, stroke, width] of PATHS) {
    const el = document.createElementNS(SVG_NS, 'path');
    el.setAttribute('d', d);
    el.setAttribute('fill', fill);
    if (stroke) {
      el.setAttribute('stroke', stroke);
      el.setAttribute('stroke-width', width);
      el.setAttribute('stroke-linecap', 'round');
    }
    svg.appendChild(el);
  }
  return svg;
}
