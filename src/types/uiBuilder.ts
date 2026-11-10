export type ComponentCategory =
  | 'layout'
  | 'navigation'
  | 'basic'
  | 'content'
  | 'forms'
  | 'advanced'
  | 'custom';

export interface ComponentStyle {
  // Layout
  display?: 'block' | 'flex' | 'grid' | 'inline-block' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  flexWrap?: 'nowrap' | 'wrap';
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gap?: string;
  // Sizing
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  // Spacing
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  // Appearance
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  border?: string;
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  borderTop?: string;
  borderTopWidth?: string;
  borderTopColor?: string;
  borderTopStyle?: string;
  borderBottom?: string;
  borderBottomWidth?: string;
  borderBottomColor?: string;
  borderBottomStyle?: string;
  borderLeft?: string;
  borderLeftWidth?: string;
  borderLeftColor?: string;
  borderRight?: string;
  borderRightWidth?: string;
  borderRightColor?: string;
  boxShadow?: string;
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  cursor?: string;
  // Typography
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: string;
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontFamily?: string;
  // Transitions
  transition?: string;
  // Custom CSS string
  customCss?: string;
  // Arbitrary CSS property extension
  [key: string]: any;
}

export interface UIElement {
  id: string;
  name: string;
  type: string;
  category: ComponentCategory;
  tag: string;
  content?: string;
  attributes?: Record<string, string>;
  styles: ComponentStyle;
  hoverStyles?: Partial<ComponentStyle>;
  responsiveOverrides?: {
    mobile?: Partial<ComponentStyle>;
    tablet?: Partial<ComponentStyle>;
  };
  children: UIElement[];
  animationClipId?: string;
  isReusable?: boolean;
  reusableSourceId?: string;
}

export interface WebPage {
  id: string;
  name: string;
  route: string;
  isHome: boolean;
  title: string;
  description: string;
  rootElement: UIElement;
}
