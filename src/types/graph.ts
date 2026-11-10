export type GraphNodeType =
  | 'website'
  | 'page'
  | 'section'
  | 'component'
  | 'reusable_component'
  | 'layout'
  | 'data_source'
  | 'dependency'
  | 'route';

export interface GraphNodeData {
  label: string;
  type: GraphNodeType;
  targetId: string; // Linked page ID or UIElement ID
  pageRoute?: string;
  description?: string;
  status?: 'active' | 'unused' | 'broken' | 'warning';
  componentCount?: number;
}

export interface GraphEdgeData {
  type: 'hierarchy' | 'route' | 'dependency' | 'data';
  label?: string;
}

