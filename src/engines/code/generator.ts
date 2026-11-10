import { UIElement, WebPage } from '../../types/uiBuilder';
import { DesignElement } from '../../types/design';
import { AnimationClip } from '../../types/animation';
import { designElementToCss, animationClipToCssKeyframes, styleToCssProperties } from '../../utils/css';

function renderElementToHtml(el: UIElement, indent = 2): string {
  const pad = ' '.repeat(indent);
  const tag = el.tag || 'div';
  const className = `el-${el.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const attrs = Object.entries(el.attributes || {})
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  const attrStr = attrs ? ` ${attrs}` : '';

  if (['input', 'img', 'hr', 'br'].includes(tag)) {
    return `${pad}<${tag} class="${className}"${attrStr} />`;
  }

  const childHtml = el.children.map(c => renderElementToHtml(c, indent + 2)).join('\n');
  const inner = el.content ? `${el.content}${childHtml ? '\n' + childHtml + '\n' + pad : ''}` : (childHtml ? '\n' + childHtml + '\n' + pad : '');

  return `${pad}<${tag} class="${className}"${attrStr}>${inner}</${tag}>`;
}

function collectElementStyles(el: UIElement, lines: string[]): void {
  const className = `.el-${el.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const props = styleToCssProperties(el.styles);

  const cssLines = Object.entries(props).map(([k, v]) => {
    const kebab = k.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  ${kebab}: ${v};`;
  });

  if (cssLines.length > 0) {
    lines.push(`${className} {\n${cssLines.join('\n')}\n}`);
  }

  if (el.hoverStyles && Object.keys(el.hoverStyles).length > 0) {
    const hoverProps = styleToCssProperties(el.hoverStyles);
    const hoverLines = Object.entries(hoverProps).map(([k, v]) => {
      const kebab = k.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `  ${kebab}: ${v};`;
    });
    lines.push(`${className}:hover {\n${hoverLines.join('\n')}\n}`);
  }

  el.children.forEach(c => collectElementStyles(c, lines));
}

export function generateFullWebsiteCode(params: {
  pages: WebPage[];
  activePageId: string;
  designElements?: DesignElement[];
  animationClips?: AnimationClip[];
}): {
  html: string;
  css: string;
  js: string;
  reactCode: string;
} {
  const { pages, activePageId, designElements = [], animationClips = [] } = params;
  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  // 1. Generate HTML
  const bodyContent = activePage ? renderElementToHtml(activePage.rootElement, 4) : '    <div>SŌZŌ Studio Project</div>';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${activePage?.title || 'SŌZŌ Studio Website'}</title>
  <meta name="description" content="${activePage?.description || 'Built with SŌZŌ Studio'}" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
${bodyContent}
  <script src="app.js"></script>
</body>
</html>`;

  // 2. Generate CSS
  const cssLines: string[] = [
    `/* SŌZŌ Studio — Unified Project Stylesheet */`,
    `:root {`,
    `  --color-bg: #101114;`,
    `  --color-surface: #181A20;`,
    `  --color-text: #F3F4F6;`,
    `  --color-accent: #8B7CFF;`,
    `}`,
    `* { box-sizing: border-box; margin: 0; padding: 0; }`,
    `body { background-color: var(--color-bg); color: var(--color-text); font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; }`,
    ``,
    `/* Component Styles */`,
  ];

  if (activePage) {
    collectElementStyles(activePage.rootElement, cssLines);
  }

  // Add Design Elements CSS
  if (designElements.length > 0) {
    cssLines.push(`\n/* Design Studio Elements */`);
    designElements.forEach(el => {
      cssLines.push(designElementToCss(el));
    });
  }

  // Add Animation Keyframes
  if (animationClips.length > 0) {
    cssLines.push(`\n/* Animation Lab Keyframes */`);
    animationClips.forEach(clip => {
      const { keyframesCss, animationRule } = animationClipToCssKeyframes(clip);
      cssLines.push(keyframesCss);
      cssLines.push(`.anim-${clip.name.toLowerCase().replace(/[^a-z0-9]/g, '_')} {\n  ${animationRule}\n}`);
    });
  }

  const css = cssLines.join('\n');

  // 3. Generate JS
  const js = `// SŌZŌ Studio — Interactive Application Script
document.addEventListener('DOMContentLoaded', () => {
  console.log('SŌZŌ Studio Website initialized cleanly.');
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const el = document.querySelector(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
`;

  // 4. Generate React Code
  const reactCode = `import React from 'react';
import './styles.css';

export default function ${activePage?.name.replace(/[^a-zA-Z0-9]/g, '') || 'App'}() {
  return (
    <main className="min-h-screen bg-[#101114] text-[#F5F5F7]">
      {/* Generated by SŌZŌ Studio */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight">${activePage?.title || 'SŌZŌ Studio Project'}</h1>
        <p className="mt-2 text-zinc-400">${activePage?.description || 'Built visual-first with SŌZŌ Studio'}</p>
      </div>
    </main>
  );
}
`;

  return { html, css, js, reactCode };
}

