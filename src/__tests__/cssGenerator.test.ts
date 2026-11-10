import { describe, it, expect } from 'vitest';
import { designElementToCss, animationClipToCssKeyframes, styleToCssProperties } from '../utils/css';
import { DesignElement } from '../types/design';
import { AnimationClip } from '../types/animation';

describe('CSS Utility Engine', () => {
  it('converts component style object into CSS properties', () => {
    const props = styleToCssProperties({
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#181A20',
      width: '100%',
    });

    expect(props.display).toBe('flex');
    expect(props.flexDirection).toBe('column');
    expect(props.backgroundColor).toBe('#181A20');
    expect(props.width).toBe('100%');
  });

  it('generates valid CSS from design element', () => {
    const el: DesignElement = {
      id: 'test_card',
      name: 'Card',
      type: 'rounded_rect',
      visible: true,
      locked: false,
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      fillType: 'solid',
      fillColor: '#8B7CFF',
      stroke: { color: '#30333B', width: 2, cap: 'round', join: 'round', style: 'solid' },
      corners: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8, isLinked: true },
      shadows: [],
      filters: { blur: 0, brightness: 100, contrast: 100, grayscale: 0, hueRotate: 0, sepia: 0, opacity: 1 },
      blendMode: 'normal',
    };

    const css = designElementToCss(el);
    expect(css).toContain('width: 200px;');
    expect(css).toContain('height: 100px;');
    expect(css).toContain('background-color: #8B7CFF;');
    expect(css).toContain('border-radius: 8px 8px 8px 8px;');
  });

  it('generates valid @keyframes CSS from animation clip', () => {
    const clip: AnimationClip = {
      id: 'clip_fade',
      name: 'FadeIn',
      durationMs: 1000,
      delayMs: 0,
      iterationCount: 'infinite',
      direction: 'normal',
      fillMode: 'forwards',
      tracks: [
        {
          id: 'tr_op',
          property: 'opacity',
          label: 'Opacity',
          unit: '',
          defaultValue: 0,
          keyframes: [
            { id: 'k1', timeMs: 0, value: 0, easing: 'linear' },
            { id: 'k2', timeMs: 1000, value: 1, easing: 'linear' },
          ],
          enabled: true,
        },
      ],
    };

    const { keyframesCss, animationRule } = animationClipToCssKeyframes(clip);
    expect(keyframesCss).toContain('@keyframes anim_FadeIn');
    expect(keyframesCss).toContain('0%');
    expect(keyframesCss).toContain('100%');
    expect(animationRule).toContain('anim_FadeIn 1.00s');
  });
});

