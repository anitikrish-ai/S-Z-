export type WorkspaceId = 'design' | 'animation' | 'builder' | 'graph' | 'code' | 'security';

export interface ProjectMetadata {
  id: string;
  name: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  author?: string;
  description: string;
}

export interface ResponsiveBreakpoint {
  id: string;
  name: string;
  width: number;
  icon: string;
}

export interface ProjectSettings {
  defaultTheme: 'dark' | 'light';
  primaryColor: string;
  cssPrefix: string;
  gridSize: number;
  snapToGrid: boolean;
  autosaveIntervalMs: number;
}

export interface ProjectFile {
  id: string;
  path: string;
  name: string;
  language: 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown';
  content: string;
  readOnly?: boolean;
  generated?: boolean;
}

export interface GlobalProjectState {
  metadata: ProjectMetadata;
  settings: ProjectSettings;
  activeWorkspace: WorkspaceId;
  files: Record<string, ProjectFile>;
}

