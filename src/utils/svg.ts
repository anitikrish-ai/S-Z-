import { DesignElement } from '../types/design';

export function designElementToSvg(el: DesignElement): string {
  let content = '';

  const fill = el.fillType === 'solid' ? el.fillColor : (el.fillType === 'transparent' ? 'none' : el.fillColor);
  const stroke = el.stroke.width > 0 ? el.stroke.color : 'none';
  const strokeWidth = el.stroke.width;
  const strokeDash = el.stroke.dashPattern?.join(' ') || (el.stroke.style === 'dashed' ? '6 4' : (el.stroke.style === 'dotted' ? '2 2' : 'none'));

  switch (el.type) {
    case 'rectangle':
    case 'rounded_rect':
      content = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.corners.topLeft}" ry="${el.corners.topLeft}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`;
      break;

    case 'circle':
      content = `<circle cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" r="${el.width / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      break;

    case 'ellipse':
      content = `<ellipse cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      break;

    case 'line':
      content = `<line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y + el.height}" stroke="${stroke === 'none' ? el.fillColor : stroke}" stroke-width="${strokeWidth || 2}" />`;
      break;

    case 'arrow':
      content = `
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="${stroke === 'none' ? el.fillColor : stroke}" />
          </marker>
        </defs>
        <line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y + el.height}" stroke="${stroke === 'none' ? el.fillColor : stroke}" stroke-width="${strokeWidth || 2}" marker-end="url(#arrowhead)" />
      `;
      break;

    case 'pen_path':
    case 'brush_path':
      if (el.svgPath) {
        content = `<path d="${el.svgPath}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" />`;
      }
      break;

    case 'text':
      content = `<text x="${el.x}" y="${el.y + (el.typography?.fontSize || 16)}" font-family="${el.typography?.fontFamily || 'sans-serif'}" font-size="${el.typography?.fontSize || 16}px" font-weight="${el.typography?.fontWeight || 400}" fill="${el.typography?.color || el.fillColor}">${el.text || 'Text'}</text>`;
      break;

    case 'polygon': {
      const sides = el.polygonSides || 6;
      const rx = el.width / 2;
      const ry = el.height / 2;
      const cx = el.x + rx;
      const cy = el.y + ry;
      const points: string[] = [];
      for (let i = 0; i < sides; i++) {
        const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
        points.push(`${cx + rx * Math.cos(a)},${cy + ry * Math.sin(a)}`);
      }
      content = `<polygon points="${points.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      break;
    }

    case 'star': {
      const pointsCount = el.starPoints || 5;
      const rx = el.width / 2;
      const ry = el.height / 2;
      const cx = el.x + rx;
      const cy = el.y + ry;
      const innerRatio = el.starInnerRadiusRatio || 0.45;
      const pts: string[] = [];
      for (let i = 0; i < pointsCount * 2; i++) {
        const r = i % 2 === 0 ? rx : rx * innerRatio;
        const a = (i * Math.PI) / pointsCount - Math.PI / 2;
        pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
      }
      content = `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      break;
    }

    default:
      content = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${fill}" />`;
  }

  return content;
}

export function exportElementsToSvgString(elements: DesignElement[], width = 800, height = 600): string {
  const shapes = elements.map(el => designElementToSvg(el)).join('\n  ');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${shapes}
</svg>`;
}

