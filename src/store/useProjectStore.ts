import { create } from 'zustand';
import { WorkspaceId, ProjectMetadata, ProjectSettings, ProjectFile } from '../types/project';
import { WebPage, UIElement } from '../types/uiBuilder';
import { DesignElement } from '../types/design';
import { AnimationClip } from '../types/animation';
import { generateId } from '../utils/id';
import { generateFullWebsiteCode } from '../engines/code/generator';
import { saveProjectToDb, getProjectFromDb } from '../engines/project/db';

const INITIAL_PROJECT_ID = 'sozo_studio_default_project';

const INITIAL_PAGE: WebPage = {
  id: 'page_home',
  name: 'Overview',
  route: '/',
  isHome: true,
  title: 'SŌZŌ Studio — Visual Web Development Workshop',
  description: 'Precision visual engineering, motion curves, and architecture graph.',
  rootElement: {
    id: 'root_home',
    name: 'Canvas Root',
    type: 'container',
    category: 'layout',
    tag: 'div',
    styles: {
      minHeight: '100vh',
      backgroundColor: '#101114',
      color: '#F5F5F7',
      display: 'flex',
      flexDirection: 'column',
    },
    children: [
      {
        id: 'header_nav',
        name: 'Navigation Bar',
        type: 'navbar',
        category: 'navigation',
        tag: 'nav',
        styles: {
          width: '100%',
          backgroundColor: '#18191D',
          borderBottomWidth: '1px',
          borderBottomColor: 'rgba(255,255,255,0.08)',
          paddingTop: '14px',
          paddingBottom: '14px',
          paddingLeft: '28px',
          paddingRight: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        children: [
          {
            id: 'brand_logo',
            name: 'Studio Brand',
            type: 'text',
            category: 'basic',
            tag: 'div',
            content: 'SŌZŌ',
            styles: {
              fontSize: '16px',
              fontWeight: '700',
              color: '#F5F5F7',
              letterSpacing: '0.12em',
            },
            children: [],
          },
          {
            id: 'nav_cta_btn',
            name: 'Primary Button',
            type: 'button',
            category: 'basic',
            tag: 'button',
            content: 'Explore Architecture',
            styles: {
              backgroundColor: '#8B7CFF',
              color: '#FFFFFF',
              paddingTop: '6px',
              paddingBottom: '6px',
              paddingLeft: '14px',
              paddingRight: '14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              borderWidth: '0px',
              transition: 'background-color 160ms cubic-bezier(0.16, 1, 0.3, 1)',
            },
            hoverStyles: {
              backgroundColor: '#7A6AE6',
            },
            children: [],
          },
        ],
      },
      {
        id: 'hero_section',
        name: 'Hero Section',
        type: 'section',
        category: 'layout',
        tag: 'section',
        styles: {
          paddingTop: '80px',
          paddingBottom: '80px',
          paddingLeft: '24px',
          paddingRight: '24px',
          maxWidth: '1080px',
          marginLeft: 'auto',
          marginRight: 'auto',
          textAlign: 'center',
        },
        children: [
          {
            id: 'hero_badge',
            name: 'Pill Label',
            type: 'badge',
            category: 'basic',
            tag: 'span',
            content: 'CREATIVE WORKSHOP',
            styles: {
              display: 'inline-block',
              paddingTop: '3px',
              paddingBottom: '3px',
              paddingLeft: '10px',
              paddingRight: '10px',
              backgroundColor: 'rgba(139, 124, 255, 0.12)',
              color: '#8B7CFF',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.04em',
              marginBottom: '18px',
            },
            children: [],
          },
          {
            id: 'hero_title',
            name: 'Hero Headline',
            type: 'heading',
            category: 'basic',
            tag: 'h1',
            content: 'Precision Visual Web Engineering',
            styles: {
              fontSize: '44px',
              fontWeight: '700',
              lineHeight: '1.18',
              letterSpacing: '-0.03em',
              marginBottom: '16px',
              color: '#F5F5F7',
            },
            children: [],
          },
          {
            id: 'hero_paragraph',
            name: 'Hero Subtext',
            type: 'text',
            category: 'basic',
            tag: 'p',
            content: 'Design custom CSS components, author motion curves on a visual timeline, and inspect security posture with desktop-first precision.',
            styles: {
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#96969F',
              maxWidth: '640px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '32px',
            },
            children: [],
          },
        ],
      },
    ],
  },
};

const INITIAL_DESIGN_ELEMENTS: DesignElement[] = [
  {
    id: 'shape_rect_card',
    name: 'Precision Surface Card',
    type: 'rounded_rect',
    visible: true,
    locked: false,
    x: 100,
    y: 80,
    width: 340,
    height: 220,
    rotation: 0,
    opacity: 1,
    zIndex: 1,
    fillType: 'solid',
    fillColor: '#18191D',
    stroke: { color: 'rgba(255,255,255,0.08)', width: 1, cap: 'round', join: 'round', style: 'solid' },
    corners: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, isLinked: true },
    shadows: [
      { id: 'sh_subtle', x: 0, y: 8, blur: 20, spread: -4, color: 'rgba(0,0,0,0.4)', inset: false },
    ],
    filters: { blur: 0, brightness: 100, contrast: 100, grayscale: 0, hueRotate: 0, sepia: 0, opacity: 1 },
    blendMode: 'normal',
  },
  {
    id: 'shape_accent_circle',
    name: 'Accent Metric Indicator',
    type: 'circle',
    visible: true,
    locked: false,
    x: 480,
    y: 110,
    width: 140,
    height: 140,
    rotation: 0,
    opacity: 0.9,
    zIndex: 2,
    fillType: 'solid',
    fillColor: '#8B7CFF',
    stroke: { color: 'rgba(255,255,255,0.12)', width: 1, cap: 'round', join: 'round', style: 'solid' },
    corners: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, isLinked: true },
    shadows: [],
    filters: { blur: 0, brightness: 100, contrast: 100, grayscale: 0, hueRotate: 0, sepia: 0, opacity: 0.9 },
    blendMode: 'normal',
  },
];

const INITIAL_ANIMATION_CLIPS: AnimationClip[] = [
  {
    id: 'clip_linear_reveal',
    name: 'Subtle Surface Lift',
    durationMs: 1400,
    delayMs: 0,
    iterationCount: 'infinite',
    direction: 'alternate',
    fillMode: 'both',
    tracks: [
      {
        id: 'tr_ty',
        property: 'translateY',
        label: 'Translate Y',
        unit: 'px',
        defaultValue: 0,
        keyframes: [
          { id: 'kf_1', timeMs: 0, value: 0, easing: 'ease-in-out' },
          { id: 'kf_2', timeMs: 700, value: -10, easing: 'ease-in-out' },
          { id: 'kf_3', timeMs: 1400, value: 0, easing: 'ease-in-out' },
        ],
        enabled: true,
      },
      {
        id: 'tr_op',
        property: 'opacity',
        label: 'Opacity',
        unit: '',
        defaultValue: 1,
        keyframes: [
          { id: 'kf_op1', timeMs: 0, value: 0.85, easing: 'linear' },
          { id: 'kf_op2', timeMs: 700, value: 1.0, easing: 'linear' },
          { id: 'kf_op3', timeMs: 1400, value: 0.85, easing: 'linear' },
        ],
        enabled: true,
      },
    ],
  },
];

interface ProjectStoreState {
  metadata: ProjectMetadata;
  settings: ProjectSettings;
  theme: 'dark' | 'light';
  activeWorkspace: WorkspaceId;
  pages: WebPage[];
  activePageId: string;
  designElements: DesignElement[];
  selectedDesignElementId: string | null;
  animationClips: AnimationClip[];
  activeClipId: string;
  files: Record<string, ProjectFile>;
  activeFileId: string;
  isSaving: boolean;
  lastSaved: number | null;
  selectedUIElementId: string | null;

  // Layout UI state
  isLeftSidebarOpen: boolean;
  isRightInspectorOpen: boolean;
  isBottomDrawerOpen: boolean;
  activeBottomTab: 'code' | 'timeline' | 'console';
  isMobileMenuOpen: boolean;

  // History state
  historyPast: { pages: WebPage[]; designElements: DesignElement[] }[];
  historyFuture: { pages: WebPage[]; designElements: DesignElement[] }[];

  // Actions
  toggleTheme: () => void;
  setWorkspace: (ws: WorkspaceId) => void;
  toggleLeftSidebar: () => void;
  toggleRightInspector: () => void;
  toggleBottomDrawer: () => void;
  setBottomTab: (tab: 'code' | 'timeline' | 'console') => void;
  toggleMobileMenu: () => void;

  undo: () => void;
  redo: () => void;

  createPage: (name: string, route: string) => void;
  setActivePage: (id: string) => void;
  deletePage: (id: string) => void;
  addUIElement: (parentId: string, element: UIElement) => void;
  updateUIElement: (id: string, partial: Partial<UIElement>) => void;
  removeUIElement: (id: string) => void;
  setSelectedUIElementId: (id: string | null) => void;

  addDesignElement: (el: DesignElement) => void;
  updateDesignElement: (id: string, partial: Partial<DesignElement>) => void;
  removeDesignElement: (id: string) => void;
  setSelectedDesignElementId: (id: string | null) => void;

  addAnimationClip: (clip: AnimationClip) => void;
  updateAnimationClip: (id: string, partial: Partial<AnimationClip>) => void;
  setActiveClipId: (id: string) => void;

  updateFile: (id: string, content: string) => void;
  createFile: (path: string, content: string, language: ProjectFile['language']) => void;
  setActiveFileId: (id: string) => void;
  syncCodeFromVisual: () => void;

  saveProject: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  loadProjectFromJson: (data: any) => void;
}

export const useProjectStore = create<ProjectStoreState>((set, get) => {
  const initialCode = generateFullWebsiteCode({
    pages: [INITIAL_PAGE],
    activePageId: INITIAL_PAGE.id,
    designElements: INITIAL_DESIGN_ELEMENTS,
    animationClips: INITIAL_ANIMATION_CLIPS,
  });

  const initialFiles: Record<string, ProjectFile> = {
    'file_html': {
      id: 'file_html',
      path: '/index.html',
      name: 'index.html',
      language: 'html',
      content: initialCode.html,
      generated: true,
    },
    'file_css': {
      id: 'file_css',
      path: '/styles.css',
      name: 'styles.css',
      language: 'css',
      content: initialCode.css,
      generated: true,
    },
    'file_js': {
      id: 'file_js',
      path: '/app.js',
      name: 'app.js',
      language: 'javascript',
      content: initialCode.js,
      generated: true,
    },
    'file_react': {
      id: 'file_react',
      path: '/App.tsx',
      name: 'App.tsx',
      language: 'typescript',
      content: initialCode.reactCode,
      generated: true,
    },
  };

  const pushSnapshot = () => {
    const state = get();
    set({
      historyPast: [
        ...state.historyPast.slice(-15),
        { pages: JSON.parse(JSON.stringify(state.pages)), designElements: JSON.parse(JSON.stringify(state.designElements)) },
      ],
      historyFuture: [],
    });
  };

  return {
    metadata: {
      id: INITIAL_PROJECT_ID,
      name: 'SŌZŌ Studio Project',
      version: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      description: 'Precision visual web development workspace.',
    },
    settings: {
      defaultTheme: 'dark',
      primaryColor: '#8B7CFF',
      cssPrefix: 'studio',
      gridSize: 20,
      snapToGrid: true,
      autosaveIntervalMs: 10000,
    },
    theme: 'dark',
    activeWorkspace: 'design',
    pages: [INITIAL_PAGE],
    activePageId: INITIAL_PAGE.id,
    designElements: INITIAL_DESIGN_ELEMENTS,
    selectedDesignElementId: INITIAL_DESIGN_ELEMENTS[0].id,
    animationClips: INITIAL_ANIMATION_CLIPS,
    activeClipId: INITIAL_ANIMATION_CLIPS[0].id,
    files: initialFiles,
    activeFileId: 'file_html',
    isSaving: false,
    lastSaved: Date.now(),
    selectedUIElementId: 'hero_title',

    isLeftSidebarOpen: true,
    isRightInspectorOpen: true,
    isBottomDrawerOpen: false,
    activeBottomTab: 'code',
    isMobileMenuOpen: false,

    historyPast: [],
    historyFuture: [],

    toggleTheme: () => {
      set(state => {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          if (next === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          }
        }
        return { theme: next };
      });
    },

    setWorkspace: (ws: WorkspaceId) => {
      set({ activeWorkspace: ws, isMobileMenuOpen: false });
      if (ws === 'code' || ws === 'security') {
        get().syncCodeFromVisual();
      }
    },

    toggleLeftSidebar: () => set(state => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
    toggleRightInspector: () => set(state => ({ isRightInspectorOpen: !state.isRightInspectorOpen })),
    toggleBottomDrawer: () => set(state => ({ isBottomDrawerOpen: !state.isBottomDrawerOpen })),
    setBottomTab: (tab: 'code' | 'timeline' | 'console') => set({ activeBottomTab: tab, isBottomDrawerOpen: true }),
    toggleMobileMenu: () => set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

    undo: () => {
      const state = get();
      if (state.historyPast.length === 0) return;
      const prev = state.historyPast[state.historyPast.length - 1];
      const newPast = state.historyPast.slice(0, -1);
      const current = {
        pages: JSON.parse(JSON.stringify(state.pages)),
        designElements: JSON.parse(JSON.stringify(state.designElements)),
      };
      set({
        pages: prev.pages,
        designElements: prev.designElements,
        historyPast: newPast,
        historyFuture: [current, ...state.historyFuture],
      });
      get().syncCodeFromVisual();
    },

    redo: () => {
      const state = get();
      if (state.historyFuture.length === 0) return;
      const next = state.historyFuture[0];
      const newFuture = state.historyFuture.slice(1);
      const current = {
        pages: JSON.parse(JSON.stringify(state.pages)),
        designElements: JSON.parse(JSON.stringify(state.designElements)),
      };
      set({
        pages: next.pages,
        designElements: next.designElements,
        historyPast: [...state.historyPast, current],
        historyFuture: newFuture,
      });
      get().syncCodeFromVisual();
    },

    createPage: (name: string, route: string) => {
      pushSnapshot();
      const newPage: WebPage = {
        id: generateId('page'),
        name,
        route,
        isHome: false,
        title: `${name} | CSS Studio`,
        description: `Page ${name}`,
        rootElement: {
          id: generateId('root'),
          name: `${name} Root`,
          type: 'container',
          category: 'layout',
          tag: 'div',
          styles: { minHeight: '100vh', backgroundColor: '#101114', color: '#F5F5F7', padding: '32px' },
          children: [],
        },
      };
      set(state => ({
        pages: [...state.pages, newPage],
        activePageId: newPage.id,
      }));
      get().syncCodeFromVisual();
    },

    setActivePage: (id: string) => {
      set({ activePageId: id });
      get().syncCodeFromVisual();
    },

    deletePage: (id: string) => {
      pushSnapshot();
      set(state => {
        if (state.pages.length <= 1) return state;
        const filtered = state.pages.filter(p => p.id !== id);
        return {
          pages: filtered,
          activePageId: state.activePageId === id ? filtered[0].id : state.activePageId,
        };
      });
      get().syncCodeFromVisual();
    },

    addUIElement: (parentId: string, element: UIElement) => {
      pushSnapshot();
      set(state => {
        const updateTree = (el: UIElement): UIElement => {
          if (el.id === parentId) {
            return { ...el, children: [...el.children, element] };
          }
          return { ...el, children: el.children.map(updateTree) };
        };

        const updatedPages = state.pages.map(p => {
          if (p.id === state.activePageId) {
            return { ...p, rootElement: updateTree(p.rootElement) };
          }
          return p;
        });

        return { pages: updatedPages, selectedUIElementId: element.id };
      });
      get().syncCodeFromVisual();
    },

    updateUIElement: (id: string, partial: Partial<UIElement>) => {
      set(state => {
        const updateTree = (el: UIElement): UIElement => {
          if (el.id === id) {
            return {
              ...el,
              ...partial,
              styles: partial.styles ? { ...el.styles, ...partial.styles } : el.styles,
              attributes: partial.attributes ? { ...el.attributes, ...partial.attributes } : el.attributes,
            };
          }
          return { ...el, children: el.children.map(updateTree) };
        };

        const updatedPages = state.pages.map(p => {
          if (p.id === state.activePageId) {
            return { ...p, rootElement: updateTree(p.rootElement) };
          }
          return p;
        });

        return { pages: updatedPages };
      });
      get().syncCodeFromVisual();
    },

    removeUIElement: (id: string) => {
      pushSnapshot();
      set(state => {
        const filterTree = (el: UIElement): UIElement => ({
          ...el,
          children: el.children.filter(c => c.id !== id).map(filterTree),
        });

        const updatedPages = state.pages.map(p => {
          if (p.id === state.activePageId) {
            return { ...p, rootElement: filterTree(p.rootElement) };
          }
          return p;
        });

        return {
          pages: updatedPages,
          selectedUIElementId: state.selectedUIElementId === id ? null : state.selectedUIElementId,
        };
      });
      get().syncCodeFromVisual();
    },

    setSelectedUIElementId: (id: string | null) => {
      set({ selectedUIElementId: id });
    },

    addDesignElement: (el: DesignElement) => {
      pushSnapshot();
      set(state => ({
        designElements: [...state.designElements, el],
        selectedDesignElementId: el.id,
      }));
      get().syncCodeFromVisual();
    },

    updateDesignElement: (id: string, partial: Partial<DesignElement>) => {
      set(state => ({
        designElements: state.designElements.map(el =>
          el.id === id ? { ...el, ...partial } : el
        ),
      }));
      get().syncCodeFromVisual();
    },

    removeDesignElement: (id: string) => {
      pushSnapshot();
      set(state => ({
        designElements: state.designElements.filter(el => el.id !== id),
        selectedDesignElementId: state.selectedDesignElementId === id ? null : state.selectedDesignElementId,
      }));
      get().syncCodeFromVisual();
    },

    setSelectedDesignElementId: (id: string | null) => {
      set({ selectedDesignElementId: id });
    },

    addAnimationClip: (clip: AnimationClip) => {
      pushSnapshot();
      set(state => ({
        animationClips: [...state.animationClips, clip],
        activeClipId: clip.id,
      }));
      get().syncCodeFromVisual();
    },

    updateAnimationClip: (id: string, partial: Partial<AnimationClip>) => {
      set(state => ({
        animationClips: state.animationClips.map(c =>
          c.id === id ? { ...c, ...partial } : c
        ),
      }));
      get().syncCodeFromVisual();
    },

    setActiveClipId: (id: string) => {
      set({ activeClipId: id });
    },

    updateFile: (id: string, content: string) => {
      set(state => {
        const file = state.files[id];
        if (!file) return state;
        return {
          files: {
            ...state.files,
            [id]: { ...file, content },
          },
        };
      });
    },

    createFile: (path: string, content: string, language: ProjectFile['language']) => {
      const id = generateId('file');
      const name = path.split('/').pop() || 'untitled';
      set(state => ({
        files: {
          ...state.files,
          [id]: { id, path, name, content, language },
        },
        activeFileId: id,
      }));
    },

    setActiveFileId: (id: string) => {
      set({ activeFileId: id });
    },

    syncCodeFromVisual: () => {
      const state = get();
      const code = generateFullWebsiteCode({
        pages: state.pages,
        activePageId: state.activePageId,
        designElements: state.designElements,
        animationClips: state.animationClips,
      });

      set(curr => ({
        files: {
          ...curr.files,
          'file_html': { ...curr.files['file_html'], content: code.html },
          'file_css': { ...curr.files['file_css'], content: code.css },
          'file_js': { ...curr.files['file_js'], content: code.js },
          'file_react': { ...curr.files['file_react'], content: code.reactCode },
        },
      }));
    },

    saveProject: async () => {
      set({ isSaving: true });
      const state = get();
      const projectPayload = {
        id: state.metadata.id,
        metadata: { ...state.metadata, updatedAt: Date.now() },
        settings: state.settings,
        pages: state.pages,
        activePageId: state.activePageId,
        designElements: state.designElements,
        animationClips: state.animationClips,
        files: state.files,
      };

      await saveProjectToDb(projectPayload);
      set({ isSaving: false, lastSaved: Date.now() });
    },

    loadProject: async (id: string) => {
      const data = await getProjectFromDb(id);
      if (data) {
        get().loadProjectFromJson(data);
      }
    },

    loadProjectFromJson: (data: any) => {
      if (!data) return;
      set({
        metadata: data.metadata || get().metadata,
        settings: data.settings || get().settings,
        pages: data.pages || get().pages,
        activePageId: data.activePageId || get().activePageId,
        designElements: data.designElements || get().designElements,
        animationClips: data.animationClips || get().animationClips,
        files: data.files || get().files,
        lastSaved: Date.now(),
      });
      get().syncCodeFromVisual();
    },
  };
});
