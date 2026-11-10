export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  path: string;
  isDirty?: boolean;
}

export interface ConsoleLogMessage {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  source?: string;
}

export interface DiagnosticIssue {
  id: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  sourceFile: string;
}

