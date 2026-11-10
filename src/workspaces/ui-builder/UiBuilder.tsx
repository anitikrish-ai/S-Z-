import React, { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { PREBUILT_COMPONENTS, PrebuiltComponent } from '../../registry/componentRegistry';
import { UIElement, ComponentCategory } from '../../types/uiBuilder';
import { styleToCssProperties } from '../../utils/css';
import {
  Smartphone,
  Tablet,
  Monitor,
  Plus,
  Trash2,
  FileText,
  Layers,
  Sliders,
  ChevronDown,
} from 'lucide-react';

export const UiBuilder: React.FC = () => {
  const {
    pages,
    activePageId,
    setActivePage,
    createPage,
    deletePage,
    selectedUIElementId,
    setSelectedUIElementId,
    addUIElement,
    updateUIElement,
    removeUIElement,
    isLeftSidebarOpen,
    isRightInspectorOpen,
  } = useProjectStore();

  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('layout');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [newPageName, setNewPageName] = useState('');
  const [showNewPageModal, setShowNewPageModal] = useState(false);

  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  const findElementRecursive = (root: UIElement, id: string): UIElement | null => {
    if (root.id === id) return root;
    for (const child of root.children) {
      const found = findElementRecursive(child, id);
      if (found) return found;
    }
    return null;
  };

  const selectedElement = activePage && selectedUIElementId ? findElementRecursive(activePage.rootElement, selectedUIElementId) : null;

  const handleAddComponent = (comp: PrebuiltComponent) => {
    const newEl = comp.template();
    const targetParentId = selectedElement?.id || activePage.rootElement.id;
    addUIElement(targetParentId, newEl);
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  const renderCanvasElement = (el: UIElement): React.ReactNode => {
    const isSelected = el.id === selectedUIElementId;
    const isRoot = el.id === activePage.rootElement.id;

    const baseCss = styleToCssProperties(el.styles);

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedUIElementId(el.id);
    };

    const handleTextChange = (e: React.FocusEvent<HTMLElement>) => {
      updateUIElement(el.id, { content: e.currentTarget.innerText });
    };

    return (
      <div
        key={el.id}
        onClick={handleClick}
        className={`relative transition-all ${
          !isRoot && isSelected
            ? 'ring-1 ring-[#8B7CFF]'
            : !isRoot
            ? 'hover:ring-1 hover:ring-[rgba(255,255,255,0.15)]'
            : ''
        }`}
        style={baseCss as React.CSSProperties}
      >
        {isSelected && !isRoot && (
          <div className="absolute -top-4 left-0 bg-[#8B7CFF] text-[9px] text-white font-mono px-1 py-0.2 rounded-t pointer-events-none flex items-center gap-1 z-30">
            <span>&lt;{el.tag}&gt;</span>
            <span className="opacity-75">{el.name}</span>
          </div>
        )}

        {el.content !== undefined && (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTextChange}
            className="outline-none focus:ring-1 focus:ring-[#8B7CFF] rounded px-0.5"
          >
            {el.content}
          </div>
        )}

        {el.children.map(child => renderCanvasElement(child))}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full bg-[#101114] text-[#F5F5F7] overflow-hidden">
      {/* 1. Left Pages & Component Drawer */}
      {isLeftSidebarOpen && (
        <aside className="w-64 bg-[#18191D] border-r border-[rgba(255,255,255,0.08)] flex flex-col h-full z-20 text-xs">
          {/* Pages */}
          <div className="p-3 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-[#96969F] uppercase tracking-wider">Pages</span>
              <button
                onClick={() => setShowNewPageModal(true)}
                className="p-1 text-[#8B7CFF] hover:bg-[#202126] rounded transition-colors"
                title="Create Page"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-0.5">
              {pages.map(page => (
                <div
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-[6px] cursor-pointer text-xs transition-colors ${
                    page.id === activePageId
                      ? 'bg-[#202126] text-[#8B7CFF] font-medium border border-[rgba(255,255,255,0.06)]'
                      : 'text-zinc-400 hover:bg-[#202126] hover:text-[#F5F5F7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate">{page.name}</span>
                  </div>
                  {pages.length > 1 && !page.isHome && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deletePage(page.id);
                      }}
                      className="p-0.5 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Component Categories */}
          <div className="p-2 border-b border-[rgba(255,255,255,0.08)] flex gap-1 overflow-x-auto text-[10px]">
            {(['layout', 'navigation', 'basic', 'content', 'forms'] as ComponentCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded-[4px] capitalize whitespace-nowrap transition-colors ${
                  activeCategory === cat ? 'bg-[#202126] text-[#8B7CFF] font-medium' : 'text-[#96969F] hover:text-[#F5F5F7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Component Palette List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {PREBUILT_COMPONENTS.filter(c => c.category === activeCategory).map(comp => (
              <div
                key={comp.id}
                onClick={() => handleAddComponent(comp)}
                className="p-2 bg-[#101114] border border-[rgba(255,255,255,0.08)] hover:border-[#8B7CFF] rounded-[6px] cursor-pointer transition-all hover:translate-x-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#F5F5F7]">{comp.name}</span>
                  <Plus className="w-3 h-3 text-[#8B7CFF]" />
                </div>
                <p className="text-[10px] text-[#96969F] mt-0.5">{comp.description}</p>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* 2. Responsive Center Website Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#101114]">
        {/* Device Switcher Bar */}
        <div className="h-9 bg-[#18191D] border-b border-[rgba(255,255,255,0.08)] px-3.5 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-2 text-[#96969F] text-[11px]">
            <span>Page:</span>
            <span className="text-[#F5F5F7] font-medium bg-[#202126] px-2 py-0.5 rounded-[5px] border border-[rgba(255,255,255,0.06)]">
              {activePage?.name} ({activePage?.route})
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#101114] p-0.5 rounded-[6px] border border-[rgba(255,255,255,0.08)]">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1 rounded-[4px] transition-colors ${
                viewportMode === 'desktop' ? 'bg-[#202126] text-[#8B7CFF]' : 'text-[#96969F] hover:text-[#F5F5F7]'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1 rounded-[4px] transition-colors ${
                viewportMode === 'tablet' ? 'bg-[#202126] text-[#8B7CFF]' : 'text-[#96969F] hover:text-[#F5F5F7]'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1 rounded-[4px] transition-colors ${
                viewportMode === 'mobile' ? 'bg-[#202126] text-[#8B7CFF]' : 'text-[#96969F] hover:text-[#F5F5F7]'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[10px] text-[#96969F] font-mono">
            {viewportMode === 'desktop' ? 'Fluid 100%' : getViewportWidth()}
          </div>
        </div>

        {/* Viewport Frame */}
        <div className="flex-1 overflow-auto p-4 flex justify-center bg-[#101114]">
          <div
            className="h-fit min-h-full bg-[#18191D] border border-[rgba(255,255,255,0.08)] rounded-[8px] shadow-2xl transition-all duration-180 overflow-hidden"
            style={{ width: getViewportWidth(), maxWidth: '100%' }}
          >
            {activePage && renderCanvasElement(activePage.rootElement)}
          </div>
        </div>
      </div>

      {/* 3. Right Property Inspector */}
      {isRightInspectorOpen && (
        <aside className="w-72 bg-[#18191D] border-l border-[rgba(255,255,255,0.08)] flex flex-col h-full z-20 text-xs">
          <div className="h-9 border-b border-[rgba(255,255,255,0.08)] px-3.5 flex items-center justify-between text-[#F5F5F7] font-semibold text-[11px]">
            <span>Component Inspector</span>
            {selectedElement && selectedElement.id !== activePage.rootElement.id && (
              <button
                onClick={() => removeUIElement(selectedElement.id)}
                className="p-1 text-zinc-400 hover:text-red-400 rounded"
                title="Remove Element"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {selectedElement ? (
              <>
                <div className="space-y-1.5 pb-2.5 border-b border-[rgba(255,255,255,0.08)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#96969F] font-semibold uppercase">Label:</span>
                    <input
                      type="text"
                      value={selectedElement.name}
                      onChange={e => updateUIElement(selectedElement.id, { name: e.target.value })}
                      className="bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[5px] px-2 py-0.5 text-[#F5F5F7] font-medium text-right text-[11px] w-36"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-[#96969F] uppercase tracking-wider">Layout</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[9px] text-[#96969F]">Display</span>
                      <select
                        value={selectedElement.styles.display || 'block'}
                        onChange={e => updateUIElement(selectedElement.id, { styles: { display: e.target.value as any } })}
                        className="w-full bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[5px] px-2 py-1 text-[#F5F5F7] text-[11px] outline-none"
                      >
                        <option value="block">block</option>
                        <option value="flex">flex</option>
                        <option value="grid">grid</option>
                        <option value="inline-block">inline-block</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#96969F]">Direction</span>
                      <select
                        value={selectedElement.styles.flexDirection || 'row'}
                        onChange={e => updateUIElement(selectedElement.id, { styles: { flexDirection: e.target.value as any } })}
                        className="w-full bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[5px] px-2 py-1 text-[#F5F5F7] text-[11px] outline-none"
                      >
                        <option value="row">row</option>
                        <option value="column">column</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-[#96969F] uppercase tracking-wider">Appearance</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#96969F] text-[10px]">Background:</span>
                      <input
                        type="text"
                        value={selectedElement.styles.backgroundColor || 'transparent'}
                        onChange={e => updateUIElement(selectedElement.id, { styles: { backgroundColor: e.target.value } })}
                        className="bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[5px] px-2 py-0.5 text-[#F5F5F7] font-mono text-[11px] w-32 text-right"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#96969F] text-[10px]">Text Color:</span>
                      <input
                        type="text"
                        value={selectedElement.styles.color || '#F5F5F7'}
                        onChange={e => updateUIElement(selectedElement.id, { styles: { color: e.target.value } })}
                        className="bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[5px] px-2 py-0.5 text-[#F5F5F7] font-mono text-[11px] w-32 text-right"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#96969F] text-[10px]">Radius:</span>
                      <input
                        type="text"
                        value={selectedElement.styles.borderRadius || '0px'}
                        onChange={e => updateUIElement(selectedElement.id, { styles: { borderRadius: e.target.value } })}
                        className="bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[5px] px-2 py-0.5 text-[#F5F5F7] font-mono text-[11px] w-20 text-right"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-[#96969F]">
                <p className="text-xs">No element selected</p>
                <p className="text-[11px] mt-1 text-[#686873]">Select a component on canvas to edit properties</p>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* New Page Modal */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18191D] border border-[rgba(255,255,255,0.09)] rounded-[12px] p-5 w-80 space-y-4 shadow-2xl">
            <h3 className="font-semibold text-[#F5F5F7] text-sm">Create New Page</h3>
            <input
              type="text"
              placeholder="e.g. Products, Changelog, Docs"
              value={newPageName}
              onChange={e => setNewPageName(e.target.value)}
              className="w-full bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-3 py-1.5 text-xs text-[#F5F5F7] outline-none focus:border-[#8B7CFF]"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowNewPageModal(false)}
                className="px-3 py-1.5 rounded-[6px] text-zinc-400 hover:bg-[#202126]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newPageName.trim()) {
                    const slug = `/${newPageName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
                    createPage(newPageName.trim(), slug);
                    setNewPageName('');
                    setShowNewPageModal(false);
                  }
                }}
                className="px-3 py-1.5 bg-[#8B7CFF] text-white rounded-[6px] font-medium hover:bg-[#7A6AE6]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
