import { ComponentStyle } from '../types/uiBuilder';
import { DesignElement, BoxShadow } from '../types/design';
import { AnimationClip } from '../types/animation';

export function styleToCssProperties(styles: ComponentStyle): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  const ignoredKeys = new Set(['customCss']);

  for (const [key, value] of Object.entries(styles)) {
    if (value !== undefined && value !== null && value !== '' && !ignoredKeys.has(key)) {
      result[key] = value;
    }
  }

  return result;
}

export function styleToCssString(selector: string, styles: ComponentStyle): string {
  const props = styleToCssProperties(styles);
  const lines = Object.entries(props).map(([key, val]) => {
    const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  ${kebab}: ${val};`;
  });
  return `${selector} {\n${lines.join('\n')}\n}`;
}

export function formatBoxShadow(shadow: BoxShadow): string {
  const insetStr = shadow.inset ? 'inset ' : '';
  return `${insetStr}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
}

export function designElementToCss(el: DesignElement): string {
  const lines: string[] = [];

  // Dimensions & position
  lines.push(`  width: ${el.width}px;`);
  lines.push(`  height: ${el.height}px;`);
  if (el.opacity < 1) lines.push(`  opacity: ${el.opacity};`);

  // Fill
  if (el.fillType === 'solid') {
    lines.push(`  background-color: ${el.fillColor};`);
  } else if (el.fillType === 'linear_gradient' && el.gradient) {
    const stops = el.gradient.stops.map(s => `${s.color} ${(s.offset * 100).toFixed(0)}%`).join(', ');
    lines.push(`  background: linear-gradient(${el.gradient.angle}deg, ${stops});`);
  } else if (el.fillType === 'radial_gradient' && el.gradient) {
    const stops = el.gradient.stops.map(s => `${s.color} ${(s.offset * 100).toFixed(0)}%`).join(', ');
    lines.push(`  background: radial-gradient(circle, ${stops});`);
  } else if (el.fillType === 'transparent') {
    lines.push(`  background: transparent;`);
  }

  // Stroke
  if (el.stroke.width > 0) {
    lines.push(`  border: ${el.stroke.width}px ${el.stroke.style} ${el.stroke.color};`);
  }

  // Corners
  const { topLeft, topRight, bottomRight, bottomLeft } = el.corners;
  if (topLeft || topRight || bottomRight || bottomLeft) {
    lines.push(`  border-radius: ${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px;`);
  }

  // Shadows
  if (el.shadows.length > 0) {
    const shadowList = el.shadows.map(formatBoxShadow).join(', ');
    lines.push(`  box-shadow: ${shadowList};`);
  }

  // Filters
  const filterList: string[] = [];
  if (el.filters.blur > 0) filterList.push(`blur(${el.filters.blur}px)`);
  if (el.filters.brightness !== 100) filterList.push(`brightness(${el.filters.brightness}%)`);
  if (el.filters.contrast !== 100) filterList.push(`contrast(${el.filters.contrast}%)`);
  if (el.filters.grayscale > 0) filterList.push(`grayscale(${el.filters.grayscale}%)`);
  if (el.filters.hueRotate > 0) filterList.push(`hue-rotate(${el.filters.hueRotate}deg)`);
  if (filterList.length > 0) {
    lines.push(`  filter: ${filterList.join(' ')};`);
  }

  if (el.backdropBlur && el.backdropBlur > 0) {
    lines.push(`  backdrop-filter: blur(${el.backdropBlur}px);`);
  }

  if (el.rotation !== 0) {
    lines.push(`  transform: rotate(${el.rotation}deg);`);
  }

  const className = `.element-${el.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'component'}`;
  return `${className} {\n${lines.join('\n')}\n}`;
}

export function animationClipToCssKeyframes(clip: AnimationClip): { keyframesCss: string; animationRule: string } {
  const durationSec = (clip.durationMs / 1000).toFixed(2);
  const delaySec = (clip.delayMs / 1000).toFixed(2);
  const animName = `anim_${clip.name.replace(/[^a-zA-Z0-9_]/g, '_')}`;

  // Collect keyframe timestamps
  const timestamps = new Set<number>();
  clip.tracks.forEach(track => {
    track.keyframes.forEach(kf => timestamps.add(kf.timeMs));
  });

  const sortedTimes = Array.from(timestamps).sort((a, b) => a - b);
  if (sortedTimes.length === 0) {
    sortedTimes.push(0, clip.durationMs);
  }

  const kfBlocks = sortedTimes.map(time => {
    const percentage = clip.durationMs > 0 ? Math.round((time / clip.durationMs) * 100) : 0;
    const propLines: string[] = [];
    const transforms: string[] = [];

    clip.tracks.forEach(track => {
      // Find keyframe at or interpolated
      const exact = track.keyframes.find(k => k.timeMs === time);
      let val = exact ? exact.value : undefined;
      if (val === undefined && track.keyframes.length > 0) {
        val = track.keyframes[0].value;
      }
      if (val === undefined) return;

      switch (track.property) {
        case 'translateX':
          transforms.push(`translateX(${val}px)`);
          break;
        case 'translateY':
          transforms.push(`translateY(${val}px)`);
          break;
        case 'rotate':
          transforms.push(`rotate(${val}deg)`);
          break;
        case 'scaleX':
          transforms.push(`scaleX(${val})`);
          break;
        case 'scaleY':
          transforms.push(`scaleY(${val})`);
          break;
        case 'opacity':
          propLines.push(`    opacity: ${val};`);
          break;
        case 'backgroundColor':
          propLines.push(`    background-color: ${val};`);
          break;
        case 'borderRadius':
          propLines.push(`    border-radius: ${val}px;`);
          break;
        case 'boxShadowBlur':
          propLines.push(`    box-shadow: 0 4px ${val}px rgba(0, 0, 0, 0.4);`);
          break;
        case 'filterBlur':
          propLines.push(`    filter: blur(${val}px);`);
          break;
      }
    });

    if (transforms.length > 0) {
      propLines.push(`    transform: ${transforms.join(' ')};`);
    }

    return `  ${percentage}% {\n${propLines.join('\n')}\n  }`;
  });

  const keyframesCss = `@keyframes ${animName} {\n${kfBlocks.join('\n')}\n}`;
  const iter = clip.iterationCount === 'infinite' ? 'infinite' : clip.iterationCount;
  const animationRule = `animation: ${animName} ${durationSec}s ease ${delaySec}s ${iter} ${clip.direction} ${clip.fillMode};`;

  return { keyframesCss, animationRule };
}

