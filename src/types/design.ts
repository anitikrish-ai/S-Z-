export type DesignTool =
  | 'select'
  | 'move'
  | 'rectangle'
  | 'rounded_rect'
  | 'circle'
  | 'ellipse'
  | 'polygon'
  | 'star'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'node_editor'
  | 'brush'
  | 'eraser'
  | 'text'
  | 'image'
  | 'gradient'
  | 'eyedropper';

export type FillType = 'solid' | 'linear_gradient' | 'radial_gradient' | 'conic_gradient' | 'transparent';

export interface GradientStop {
  offset: number; // 0 to 1
  color: string;
}

export interface GradientFill {
  type: FillType;
  angle: number; // in degrees
  stops: GradientStop[];
}

export interface BoxShadow {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export interface CornerRadius {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
  isLinked: boolean;
}

export interface StrokeStyle {
  color: string;
  width: number;
  cap: 'butt' | 'round' | 'square';
  join: 'miter' | 'round' | 'bevel';
  dashPattern?: number[];
  style: 'solid' | 'dashed' | 'dotted';
}

export interface CssFilters {
  blur: number; // px
  brightness: number; // % (default 100)
  contrast: number; // % (default 100)
  grayscale: number; // %
  hueRotate: number; // deg
  sepia: number; // %
  opacity: number; // 0 to 1
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
}

export interface PathPoint {
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

export interface DesignElement {
  id: string;
  name: string;
  type:
    | 'rectangle'
    | 'rounded_rect'
    | 'circle'
    | 'ellipse'
    | 'polygon'
    | 'star'
    | 'line'
    | 'arrow'
    | 'pen_path'
    | 'brush_path'
    | 'text'
    | 'image'
    | 'group';
  visible: boolean;
  locked: boolean;
  // Position & transform
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  // Styling
  fillType: FillType;
  fillColor: string;
  gradient?: GradientFill;
  stroke: StrokeStyle;
  corners: CornerRadius;
  shadows: BoxShadow[];
  filters: CssFilters;
  backdropBlur?: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge';
  // Specialized properties
  polygonSides?: number;
  starPoints?: number;
  starInnerRadiusRatio?: number;
  text?: string;
  typography?: TypographyStyle;
  imageUrl?: string;
  pathPoints?: PathPoint[];
  svgPath?: string;
  childrenIds?: string[]; // For grouping
}

