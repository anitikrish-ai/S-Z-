export type AnimatableProperty =
  | 'translateX'
  | 'translateY'
  | 'rotate'
  | 'scaleX'
  | 'scaleY'
  | 'opacity'
  | 'backgroundColor'
  | 'borderRadius'
  | 'boxShadowBlur'
  | 'filterBlur';

export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier';

export interface KeyframePoint {
  id: string;
  timeMs: number; // e.g. 0 to 5000 ms
  value: number | string;
  easing: EasingFunction;
  bezierPoints?: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface AnimationTrack {
  id: string;
  property: AnimatableProperty;
  label: string;
  unit: string;
  defaultValue: number | string;
  min?: number;
  max?: number;
  step?: number;
  keyframes: KeyframePoint[];
  enabled: boolean;
}

export interface AnimationClip {
  id: string;
  name: string;
  targetElementId?: string; // Links to design or UI element
  durationMs: number;
  delayMs: number;
  iterationCount: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
  tracks: AnimationTrack[];
}

export interface AnimationState {
  clips: AnimationClip[];
  activeClipId: string;
  currentTimeMs: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.25, 0.5, 1, 1.5, 2
  zoom: number; // 1 to 5 scale for timeline pixels/ms
  selectedKeyframeId: string | null;
  selectedTrackId: string | null;
}

