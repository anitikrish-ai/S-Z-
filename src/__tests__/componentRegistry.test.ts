import { describe, it, expect } from 'vitest';
import { PREBUILT_COMPONENTS } from '../registry/componentRegistry';

describe('Component Registry', () => {
  it('contains layout, basic, navigation, and content components', () => {
    const categories = new Set(PREBUILT_COMPONENTS.map(c => c.category));
    expect(categories.has('layout')).toBe(true);
    expect(categories.has('navigation')).toBe(true);
    expect(categories.has('basic')).toBe(true);
    expect(categories.has('content')).toBe(true);
    expect(categories.has('forms')).toBe(true);
  });

  it('generates valid UIElement templates with unique IDs', () => {
    const el1 = PREBUILT_COMPONENTS[0].template();
    const el2 = PREBUILT_COMPONENTS[0].template();

    expect(el1.id).not.toBe(el2.id);
    expect(el1.tag).toBeDefined();
    expect(el1.styles).toBeDefined();
  });
});

