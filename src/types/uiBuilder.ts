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
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  // Appearance
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
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
}

export interface UIElement {
  id: string;
  name: string;
  type: string; // e.g. 'container', 'button', 'card', 'navbar', etc.
  category: ComponentCategory;
  tag: string; // HTML tag: 'div', 'button', 'h1', 'p', 'nav', 'section', etc.
  content?: string; // Text content or innerHTML
  attributes?: Record<string, string>; // e.g. { href: '/', src: '...', placeholder: '...' }
  styles: ComponentStyle;
  hoverStyles?: Partial<ComponentStyle>;
  responsiveOverrides?: {
    mobile?: Partial<ComponentStyle>;
    tablet?: Partial<ComponentStyle>;
  };
  children: UIElement[];
  animationClipId?: string; // Links to animation clip
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

