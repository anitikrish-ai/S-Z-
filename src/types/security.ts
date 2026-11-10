export type SecuritySeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type SecurityCategory =
  | 'secrets'
  | 'xss'
  | 'injection'
  | 'headers'
  | 'dependencies'
  | 'auth'
  | 'validation'
  | 'configuration';

export interface SecurityFinding {
  id: string;
  title: string;
  category: SecurityCategory;
  severity: SecuritySeverity;
  fileLocation: string;
  lineNumber?: number;
  snippet?: string;
  description: string;
  riskExplanation: string;
  suggestedFix: string;
  fixSnippet?: string;
  verificationStatus: 'unresolved' | 'fixed' | 'dismissed';
}

export interface SecurityAuditReport {
  timestamp: number;
  projectName: string;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  findings: SecurityFinding[];
  score: number; // 0 to 100
}

export interface SecurityHeaderRule {
  header: string;
  recommendedValue: string;
  currentStatus: 'configured' | 'missing' | 'weak';
  description: string;
}

