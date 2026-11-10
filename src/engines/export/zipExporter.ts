import JSZip from 'jszip';
import { ProjectFile } from '../../types/project';
import { DesignElement } from '../../types/design';
import { AnimationClip } from '../../types/animation';
import { SecurityAuditReport } from '../../types/security';
import { exportElementsToSvgString } from '../../utils/svg';
import { animationClipToCssKeyframes, designElementToCss } from '../../utils/css';

export async function exportProjectAsZip(params: {
  projectName: string;
  files: Record<string, ProjectFile>;
  designElements: DesignElement[];
  animationClips: AnimationClip[];
  securityReport?: SecurityAuditReport | null;
  fullProjectJson: any;
}): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(params.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')) || zip;

  // 1. Add all project files
  Object.values(params.files).forEach(file => {
    folder.file(file.path.replace(/^\//, ''), file.content);
  });

  // 2. Export design studio SVG
  if (params.designElements.length > 0) {
    const svgContent = exportElementsToSvgString(params.designElements, 1200, 800);
    folder.file('assets/vector-elements.svg', svgContent);

    const designCss = params.designElements.map(el => designElementToCss(el)).join('\n\n');
    folder.file('assets/design-elements.css', designCss);
  }

  // 3. Export animation keyframes
  if (params.animationClips.length > 0) {
    const animCss = params.animationClips
      .map(clip => {
        const { keyframesCss, animationRule } = animationClipToCssKeyframes(clip);
        return `${keyframesCss}\n\n.anim-${clip.name.replace(/[^a-zA-Z0-9_]/g, '_')} {\n  ${animationRule}\n}`;
      })
      .join('\n\n');
    folder.file('assets/animations.css', animCss);
  }

  // 4. Export security report if available
  if (params.securityReport) {
    folder.file('reports/security-audit.json', JSON.stringify(params.securityReport, null, 2));
  }

  // 5. Export project JSON for instant re-import into SŌZŌ Studio
  folder.file('sozo-project.json', JSON.stringify(params.fullProjectJson, null, 2));

  // 6. Add README
  const readme = `# ${params.projectName}
Exported from **SŌZŌ Studio** — Precision Visual Web Development Workshop.

## Project Structure
- \`index.html\` - Semantic responsive website markup
- \`styles.css\` - Production CSS styling with tokens and component classes
- \`app.js\` - Vanilla interactive scripts
- \`assets/vector-elements.svg\` - Clean SVG vector graphics
- \`assets/animations.css\` - High-performance CSS keyframe animations
- \`sozo-project.json\` - Project file for SŌZŌ Studio

## Running the Project
Open \`index.html\` in any modern browser, or serve using any static server:
\`\`\`bash
npx serve .
\`\`\`
`;
  folder.file('README.md', readme);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

