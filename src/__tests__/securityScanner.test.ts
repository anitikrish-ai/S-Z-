import { describe, it, expect } from 'vitest';
import { runSecurityAudit } from '../engines/security/scanner';
import { ProjectFile } from '../types/project';

describe('Security Audit Scanner', () => {
  it('detects exposed hardcoded secrets and tokens', () => {
    const mockFiles: Record<string, ProjectFile> = {
      'file_api': {
        id: 'file_api',
        path: '/api.js',
        name: 'api.js',
        language: 'javascript',
        content: `const apiKey = "AIzaSyD9183918239128391823912";`,
      },
    };

    const audit = runSecurityAudit(mockFiles, 'Test Project');
    expect(audit.findings.some(f => f.title === 'Hardcoded Secret or Token')).toBe(true);
    expect(audit.criticalCount).toBeGreaterThan(0);
    expect(audit.score).toBeLessThan(100);
  });

  it('detects unsafe innerHTML assignment', () => {
    const mockFiles: Record<string, ProjectFile> = {
      'file_dom': {
        id: 'file_dom',
        path: '/dom.js',
        name: 'dom.js',
        language: 'javascript',
        content: `element.innerHTML = userInput;`,
      },
    };

    const audit = runSecurityAudit(mockFiles, 'Test Project');
    expect(audit.findings.some(f => f.title === 'Unsafe innerHTML Assignment')).toBe(true);
    expect(audit.highCount).toBeGreaterThan(0);
  });

  it('awards high security score for clean code with CSP', () => {
    const mockFiles: Record<string, ProjectFile> = {
      'file_html': {
        id: 'file_html',
        path: '/index.html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="default-src 'self';">
</head>
<body>
  <h1>Safe Page</h1>
</body>
</html>`,
      },
    };

    const audit = runSecurityAudit(mockFiles, 'Test Project');
    expect(audit.findings.length).toBe(0);
    expect(audit.score).toBe(100);
  });
});

