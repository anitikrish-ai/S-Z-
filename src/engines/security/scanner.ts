import { SecurityFinding, SecurityAuditReport } from '../../types/security';
import { ProjectFile } from '../../types/project';
import { generateId } from '../../utils/id';

interface SecurityRule {
  id: string;
  title: string;
  category: SecurityFinding['category'];
  severity: SecurityFinding['severity'];
  regex: RegExp;
  description: string;
  riskExplanation: string;
  suggestedFix: string;
  fixSnippet?: string;
}

const SECURITY_RULES: SecurityRule[] = [
  // Secrets
  {
    id: 'sec_hardcoded_jwt_secret',
    title: 'Hardcoded Secret or Token',
    category: 'secrets',
    severity: 'Critical',
    regex: /(secret|token|password|apiKey|api_key)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i,
    description: 'Found hardcoded confidential API key, secret token or password in client source.',
    riskExplanation: 'Hardcoded secrets are visible to anyone inspecting client-side bundle or source control, leading to unauthorized access.',
    suggestedFix: 'Move secret values to environment variables (.env) and never expose them in client-side code.',
    fixSnippet: 'const apiKey = process.env.VITE_API_KEY;',
  },
  {
    id: 'sec_private_key',
    title: 'Exposed Private Key',
    category: 'secrets',
    severity: 'Critical',
    regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
    description: 'Cryptographic private key detected in repository source files.',
    riskExplanation: 'Private keys allow attackers to decrypt communications, impersonate servers, or sign forged tokens.',
    suggestedFix: 'Immediately revoke the compromised key and store keys exclusively in secure secrets management (Vault, HSM).',
  },
  // XSS
  {
    id: 'sec_inner_html',
    title: 'Unsafe innerHTML Assignment',
    category: 'xss',
    severity: 'High',
    regex: /\.innerHTML\s*=\s*[^;]+/,
    description: 'Direct assignment to element.innerHTML without sanitization.',
    riskExplanation: 'If user input is injected into innerHTML, attackers can execute arbitrary malicious JavaScript in user browsers (XSS).',
    suggestedFix: 'Use textContent, innerText, or sanitize HTML using DOMPurify before rendering.',
    fixSnippet: 'element.textContent = userProvidedText;',
  },
  {
    id: 'sec_dangerously_set_inner_html',
    title: 'Unsanitized dangerouslySetInnerHTML',
    category: 'xss',
    severity: 'High',
    regex: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:/,
    description: 'Usage of React dangerouslySetInnerHTML without verified HTML sanitization.',
    riskExplanation: 'Bypasses React built-in XSS protection, allowing attackers to execute stored or reflected cross-site scripts.',
    suggestedFix: 'Wrap raw HTML through DOMPurify.sanitize(content) or use standard React JSX elements.',
    fixSnippet: '<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rawHtml) }} />',
  },
  {
    id: 'sec_eval_exec',
    title: 'Unsafe Dynamic Code Execution (eval)',
    category: 'xss',
    severity: 'Critical',
    regex: /\beval\s*\(/,
    description: 'Use of eval() function to execute dynamic JavaScript strings.',
    riskExplanation: 'eval() is extremely dangerous; any controlled input will execute as high-privilege scripts within the application context.',
    suggestedFix: 'Refactor code to use JSON.parse() for structured data or standard function dispatchers.',
    fixSnippet: 'const data = JSON.parse(jsonString);',
  },
  // Target blank vulnerability
  {
    id: 'sec_target_blank_noopener',
    title: 'External Link missing rel="noopener noreferrer"',
    category: 'xss',
    severity: 'Medium',
    regex: /<a[^>]*target=["']_blank["'](?![^>]*rel=["'][^"']*(noopener|noreferrer)[^"']*["'])[^>]*>/i,
    description: 'External link opens in new tab without rel="noopener noreferrer".',
    riskExplanation: 'The target page can access window.opener and potentially navigate the parent page to a phishing website (Reverse Tabnabbing).',
    suggestedFix: 'Add rel="noopener noreferrer" to all links that open with target="_blank".',
    fixSnippet: '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>',
  },
  // HTTP instead of HTTPS
  {
    id: 'sec_insecure_http',
    title: 'Insecure Inbound Resource (HTTP)',
    category: 'configuration',
    severity: 'Low',
    regex: /http:\/\/(?!localhost|127\.0\.0\.1)[a-zA-Z0-9.\-]+\.[a-z]{2,}/i,
    description: 'Plain HTTP URL used for external asset or API endpoint.',
    riskExplanation: 'Unencrypted HTTP traffic can be intercepted, read, or modified by man-in-the-middle (MITM) attackers on the network.',
    suggestedFix: 'Enforce HTTPS for all external URLs and API requests.',
  },
  // SQL Injection patterns
  {
    id: 'sec_sql_injection_concat',
    title: 'Potential SQL Query Concatenation',
    category: 'injection',
    severity: 'High',
    regex: /(SELECT|INSERT|UPDATE|DELETE)\s+.*WHERE\s+.*\+\s*['"]?[a-zA-Z0-9_]+/i,
    description: 'SQL query constructed via string concatenation instead of parameterized placeholders.',
    riskExplanation: 'Attackers can manipulate SQL syntax to bypass authentication, extract database contents, or drop tables.',
    suggestedFix: 'Always use parameterized queries (e.g. $1, ?, or ORM methods).',
    fixSnippet: 'db.query("SELECT * FROM users WHERE id = $1", [userId]);',
  },
];

export function runSecurityAudit(files: Record<string, ProjectFile>, projectName: string): SecurityAuditReport {
  const findings: SecurityFinding[] = [];

  // 1. Scan code files against security rules
  Object.values(files).forEach(file => {
    const lines = file.content.split('\n');

    SECURITY_RULES.forEach(rule => {
      lines.forEach((lineText, index) => {
        if (rule.regex.test(lineText)) {
          findings.push({
            id: generateId('sec'),
            title: rule.title,
            category: rule.category,
            severity: rule.severity,
            fileLocation: file.path,
            lineNumber: index + 1,
            snippet: lineText.trim().substring(0, 100),
            description: rule.description,
            riskExplanation: rule.riskExplanation,
            suggestedFix: rule.suggestedFix,
            fixSnippet: rule.fixSnippet,
            verificationStatus: 'unresolved',
          });
        }
      });
    });
  });

  // 2. Check for missing CSP & Security Headers in HTML
  const htmlFile = Object.values(files).find(f => f.path.endsWith('.html'));
  if (htmlFile) {
    if (!htmlFile.content.includes('Content-Security-Policy')) {
      findings.push({
        id: generateId('sec_csp'),
        title: 'Missing Content Security Policy (CSP)',
        category: 'headers',
        severity: 'Medium',
        fileLocation: htmlFile.path,
        lineNumber: 5,
        description: 'No Content-Security-Policy meta tag or header detected in HTML configuration.',
        riskExplanation: 'Without CSP, the browser has no policy restricting domains from which scripts, images, and frames can be loaded.',
        suggestedFix: 'Add a robust Content-Security-Policy meta tag to index.html.',
        fixSnippet: '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:;">',
        verificationStatus: 'unresolved',
      });
    }
  }

  // Calculate severity counts
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let infoCount = 0;

  findings.forEach(f => {
    switch (f.severity) {
      case 'Critical': criticalCount++; break;
      case 'High': highCount++; break;
      case 'Medium': mediumCount++; break;
      case 'Low': lowCount++; break;
      case 'Informational': infoCount++; break;
    }
  });

  // Security score calculation
  const penalty = (criticalCount * 30) + (highCount * 15) + (mediumCount * 7) + (lowCount * 2);
  const score = Math.max(0, 100 - penalty);

  return {
    timestamp: Date.now(),
    projectName,
    totalFindings: findings.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    findings,
    score,
  };
}

