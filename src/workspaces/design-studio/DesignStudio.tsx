import React, { useState, useRef } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { DesignTool, DesignElement, FillType } from '../../types/design';
import { generateId } from '../../utils/id';
import { designElementToCss } from '../../utils/css';
import { exportElementsToSvgString } from '../../utils/svg';
import {
  MousePointer,
  Square,
  Circle,
  Type,
  Minus,
  ArrowRight,
  Sparkles,
  Hexagon,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Code,
  Sliders,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const DesignStudio: React.FC = () => {
  const {
    designElements,
    selectedDesignElementId,
    addDesignElement,
    updateDesignElement,
    removeDesignElement,
    setSelectedDesignElementId,
    isLeftSidebarOpen,
    isRightInspectorOpen,
  } = useProjectStore();

  const [activeTool, setActiveTool] = useState<DesignTool>('select');
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState<'properties' | 'layers' | 'code'>('properties');
  const [copiedCode, setCopiedCode] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; initialElX: number; initialElY: number }>({
    x: 0,
    y: 0,
    initialElX: 0,
    initialElY: 0,
  });

  const selectedElement = designElements.find(el => el.id === selectedDesignElementId);

  // Click on canvas to drop new shape if a shape tool is active
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'select' || isDraggingRef.current) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = Math.round((e.clientX - rect.left) / zoom);
    const clickY = Math.round((e.clientY - rect.top) / zoom);

    let newEl: DesignElement;

    const baseProps = {
      id: generateId('shape'),
      visible: true,
      locked: false,
      x: clickX - 60,
      y: clickY - 45,
      width: 120,
      height: 90,
      rotation: 0,
      opacity: 1,
      zIndex: designElements.length + 1,
      fillType: 'solid' as FillType,
      fillColor: '#8B7CFF',
      stroke: { color: 'rgba(255,255,255,0.08)', width: 1, cap: 'round' as const, join: 'round' as const, style: 'solid' as const },
      corners: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10, isLinked: true },
      shadows: [],
      filters: { blur: 0, brightness: 100, contrast: 100, grayscale: 0, hueRotate: 0, sepia: 0, opacity: 1 },
      blendMode: 'normal' as const,
    };

    switch (activeTool) {
      case 'rectangle':
        newEl = { ...baseProps, name: 'Rectangle', type: 'rectangle', width: 140, height: 90 };
        break;
      case 'rounded_rect':
        newEl = { ...baseProps, name: 'Rounded Card', type: 'rounded_rect', width: 160, height: 100, corners: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, isLinked: true } };
        break;
      case 'circle':
        newEl = { ...baseProps, name: 'Circle', type: 'circle', width: 100, height: 100 };
        break;
      case 'polygon':
        newEl = { ...baseProps, name: 'Hexagon', type: 'polygon', width: 110, height: 110, polygonSides: 6 };
        break;
      case 'star':
        newEl = { ...baseProps, name: 'Star', type: 'star', width: 120, height: 120, starPoints: 5, starInnerRadiusRatio: 0.45 };
        break;
      case 'line':
        newEl = { ...baseProps, name: 'Line', type: 'line', width: 160, height: 0, stroke: { color: '#8B7CFF', width: 2, cap: 'round', join: 'round', style: 'solid' } };
        break;
      case 'arrow':
        newEl = { ...baseProps, name: 'Arrow', type: 'arrow', width: 160, height: 0, stroke: { color: '#8B7CFF', width: 2, cap: 'round', join: 'round', style: 'solid' } };
        break;
      case 'text':
        newEl = {
          ...baseProps,
          name: 'Text Label',
          type: 'text',
          text: 'Precision Element',
          typography: {
            fontFamily: '-apple-system, sans-serif',
            fontSize: 20,
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: 0,
            textAlign: 'left',
            textDecoration: 'none',
            color: '#F5F5F7',
          },
        };
        break;
      default:
        return;
    }

    addDesignElement(newEl);
    setActiveTool('select');
  };

  const handleElementMouseDown = (e: React.MouseEvent, el: DesignElement) => {
    e.stopPropagation();
    setSelectedDesignElementId(el.id);
    if (activeTool !== 'select') return;

    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialElX: el.x,
      initialElY: el.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = (moveEvent.clientX - dragStartRef.current.x) / zoom;
      const dy = (moveEvent.clientY - dragStartRef.current.y) / zoom;
      updateDesignElement(el.id, {
        x: Math.round(dragStartRef.current.initialElX + dx),
        y: Math.round(dragStartRef.current.initialElY + dy),
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const generatedCss = selectedElement ? designElementToCss(selectedElement) : '/* Select a component to view generated CSS */';
  const generatedSvg = exportElementsToSvgString(designElements, 800, 600);

  return (
    <div className="flex h-full w-full bg-[#101114] text-[#F5F5F7] overflow-hidden">
      {/* 1. Left Narrow Icon Rail */}
      {isLeftSidebarOpen && (
        <aside className="w-12 bg-[#18191D] border-r border-[rgba(255,255,255,0.08)] flex flex-col items-center py-2.5 gap-1 z-20 transition-all">
          <button
            onClick={() => setActiveTool('select')}
            title="Select Tool (V)"
            className={`p-2 rounded-[7px] transition-all ${
              activeTool === 'select' ? 'bg-[#8B7CFF] text-white shadow-sm' : 'text-[#96969F] hover:bg-[#202126] hover:text-[#F5F5F7]'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>

          <div className="w-6 h-[1px] bg-[rgba(255,255,255,0.08)] my-1" />

          <button
            onClick={() => setActiveTool('rectangle')}
            title="Rectangle (R)"
            className={`p-2 rounded-[7px] transition-all ${
              activeTool === 'rectangle' ? 'bg-[#8B7CFF] text-white shadow-sm' : 'text-[#96969F] hover:bg-[#202126] hover:text-[#F5F5F7]'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTool('rounded_rect')}
            title="Rounded Rectangle"
            className={`p-2 rounded-[7px] transition-all ${
              activeTool === 'rounded_rect' ? 'bg-[#8B7CFF] text-white shadow-sm' : 'text-[#96969F] hover:bg-[#202126] hover:text-[#F5F5F7]'
            }`}
          >
            <div className="w-3.5 h-3.5 border border-current rounded-[4px]" />
          </button>

          <button
            onClick={() => setActiveTool('circle')}
            title="Circle (O)"
            className={`p-2 rounded-[7px] transition-all ${
              activeTool === 'circle' ? 'bg-[#8B7CFF] text-white shadow-sm' : 'text-[#96969F] hover:bg-[#202126] hover:text-[#F5F5F7]'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTool('polygon')}
            title="Polygon"
            className={`p-2 rounded-[7px] transition-all ${
              activeTool === 'polygon' ? 'bg-[#8B7CFF] text-white shadow-sm' : 'text-[#96969F] hover:bg-[#202126] hover:text-[#F5F5F7]'
            }`}
          >
            <Hexagon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTool('star')}
            title="Star"
            className={`p-2 rounded-[7px] transition-all ${
              activeTool === 'star' ? 'bg-[#8B7CFF] text-white shadow-sm' : 'text-[#96969F] hover:bg-[#202126] hover:text-[#F5F5F7]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTool('line')}
            title="Line (L)"
            className={`p-2 rounded-[7px] transition-all ${
              activeTool === 'line' ? 'bg-[#8B7CFF] text-white shadow-sm' : 'text-[#96969F] hover:bg-[#202126] hover:text-[#F5F5F7]'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTool('arrow')}
            title="Arrow"
            className={`p-2 rounded-[7px] transition-all ${
              activeTool === 'arrow' ? 'bg-[#8B7CFF] text-white shadow-sm' : 'text-[#96969F] hover:bg-[#202126] hover:text-[#F5F5F7]'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveTool('text')}
            title="Text (T)"
            className={`p-2 rounded-[7px] transition-all ${
              activeTool === 'text' ? 'bg-[#8B7CFF] text-white shadow-sm' : 'text-[#96969F] hover:bg-[#202126] hover:text-[#F5F5F7]'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* 2. Main Central Precision Canvas */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Subtle Canvas Control Strip */}
        <div className="h-9 bg-[#18191D] border-b border-[rgba(255,255,255,0.08)] px-3.5 flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-2">
            <span className="text-[#96969F] text-[11px]">Tool:</span>
            <span className="text-[#F5F5F7] font-medium capitalize bg-[#202126] px-2 py-0.5 rounded-[5px] border border-[rgba(255,255,255,0.06)] text-[11px]">
              {activeTool.replace('_', ' ')}
            </span>

            <div className="h-3 w-[1px] bg-[rgba(255,255,255,0.08)] mx-1" />

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] transition-colors ${
                showGrid ? 'bg-[#202126] text-[#8B7CFF]' : 'text-[#96969F] hover:text-[#F5F5F7]'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Grid</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-1 text-[#96969F] hover:text-[#F5F5F7] rounded hover:bg-[#202126]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[#96969F] w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-1 text-[#96969F] hover:text-[#F5F5F7] rounded hover:bg-[#202126]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 text-[#96969F] hover:text-[#F5F5F7] rounded hover:bg-[#202126]"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Vector Canvas Space */}
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`flex-1 relative overflow-auto select-none cursor-${activeTool === 'select' ? 'default' : 'crosshair'} ${
            showGrid ? 'canvas-grid-pattern' : 'bg-[#101114]'
          }`}
        >
          <div
            className="absolute top-0 left-0 w-[2400px] h-[1600px] origin-top-left"
            style={{ transform: `scale(${zoom})` }}
          >
            {designElements.map(el => {
              const isSelected = el.id === selectedDesignElementId;

              return (
                <div
                  key={el.id}
                  onMouseDown={e => handleElementMouseDown(e, el)}
                  className={`absolute group cursor-move select-none ${
                    isSelected ? 'ring-1 ring-[#8B7CFF]' : 'hover:ring-1 hover:ring-[rgba(255,255,255,0.2)]'
                  }`}
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    opacity: el.opacity,
                    transform: `rotate(${el.rotation}deg)`,
                    borderRadius: `${el.corners.topLeft}px ${el.corners.topRight}px ${el.corners.bottomRight}px ${el.corners.bottomLeft}px`,
                    backgroundColor: el.fillType === 'solid' ? el.fillColor : 'transparent',
                    border: el.stroke.width > 0 ? `${el.stroke.width}px ${el.stroke.style} ${el.stroke.color}` : 'none',
                    boxShadow: el.shadows.length > 0 ? el.shadows.map(sh => `${sh.x}px ${sh.y}px ${sh.blur}px ${sh.color}`).join(', ') : 'none',
                  }}
                >
                  {el.type === 'circle' && (
                    <div className="w-full h-full rounded-full" />
                  )}

                  {el.type === 'text' && (
                    <span
                      style={{
                        fontFamily: el.typography?.fontFamily || '-apple-system, sans-serif',
                        fontSize: `${el.typography?.fontSize || 16}px`,
                        fontWeight: el.typography?.fontWeight || 400,
                        color: el.typography?.color || '#F5F5F7',
                      }}
                    >
                      {el.text}
                    </span>
                  )}

                  {el.type === 'arrow' && (
                    <div className="w-full h-full flex items-center justify-between text-[#8B7CFF]">
                      <div className="h-[1.5px] bg-current flex-1" />
                      <ArrowRight className="w-3.5 h-3.5 ml-[-6px]" />
                    </div>
                  )}

                  {/* Minimal Apple-style selection handles */}
                  {isSelected && (
                    <>
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#8B7CFF] rounded-[1px] pointer-events-none" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#8B7CFF] rounded-[1px] pointer-events-none" />
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#8B7CFF] rounded-[1px] pointer-events-none" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#8B7CFF] rounded-[1px] pointer-events-none" />
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#202126] border border-[rgba(255,255,255,0.08)] text-[9px] text-[#F5F5F7] px-1 py-0.5 rounded font-mono pointer-events-none shadow-sm">
                        {el.width} × {el.height}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Right Grouped Properties Inspector */}
      {isRightInspectorOpen && (
        <aside className="w-72 bg-[#18191D] border-l border-[rgba(255,255,255,0.08)] flex flex-col h-full z-20 text-xs transition-all">
          {/* Tabs */}
          <div className="flex border-b border-[rgba(255,255,255,0.08)] text-[11px]">
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex-1 py-2 font-medium flex items-center justify-center gap-1.5 border-b transition-colors ${
                activeTab === 'properties'
                  ? 'border-[#8B7CFF] text-[#F5F5F7] bg-[#202126]'
                  : 'border-transparent text-[#96969F] hover:text-[#F5F5F7]'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Inspector</span>
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-2 font-medium flex items-center justify-center gap-1.5 border-b transition-colors ${
                activeTab === 'layers'
                  ? 'border-[#8B7CFF] text-[#F5F5F7] bg-[#202126]'
                  : 'border-transparent text-[#96969F] hover:text-[#F5F5F7]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Layers ({designElements.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2 font-medium flex items-center justify-center gap-1.5 border-b transition-colors ${
                activeTab === 'code'
                  ? 'border-[#8B7CFF] text-[#F5F5F7] bg-[#202126]'
                  : 'border-transparent text-[#96969F] hover:text-[#F5F5F7]'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>CSS/SVG</span>
            </button>
          </div>

          {/* Inspector Content */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {activeTab === 'properties' && (
              <>
                {selectedElement ? (
                  <>
                    {/* Element Name */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(255,255,255,0.08)]">
                      <input
                        type="text"
                        value={selectedElement.name}
                        onChange={e => updateDesignElement(selectedElement.id, { name: e.target.value })}
                        className="bg-transparent font-medium text-[#F5F5F7] outline-none text-xs w-44"
                      />
                      <button
                        onClick={() => removeDesignElement(selectedElement.id)}
                        className="p-1 text-[#96969F] hover:text-red-400 rounded"
                        title="Delete Element"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Transform */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-[#96969F] uppercase tracking-wider">Transform</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="flex items-center bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2 py-1">
                          <span className="text-[#96969F] text-[10px] mr-1.5 font-mono">X</span>
                          <input
                            type="number"
                            value={selectedElement.x}
                            onChange={e => updateDesignElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                            className="bg-transparent text-[#F5F5F7] outline-none w-full text-right font-mono text-[11px]"
                          />
                        </div>
                        <div className="flex items-center bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2 py-1">
                          <span className="text-[#96969F] text-[10px] mr-1.5 font-mono">Y</span>
                          <input
                            type="number"
                            value={selectedElement.y}
                            onChange={e => updateDesignElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                            className="bg-transparent text-[#F5F5F7] outline-none w-full text-right font-mono text-[11px]"
                          />
                        </div>
                        <div className="flex items-center bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2 py-1">
                          <span className="text-[#96969F] text-[10px] mr-1.5 font-mono">W</span>
                          <input
                            type="number"
                            value={selectedElement.width}
                            onChange={e => updateDesignElement(selectedElement.id, { width: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="bg-transparent text-[#F5F5F7] outline-none w-full text-right font-mono text-[11px]"
                          />
                        </div>
                        <div className="flex items-center bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2 py-1">
                          <span className="text-[#96969F] text-[10px] mr-1.5 font-mono">H</span>
                          <input
                            type="number"
                            value={selectedElement.height}
                            onChange={e => updateDesignElement(selectedElement.id, { height: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="bg-transparent text-[#F5F5F7] outline-none w-full text-right font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fill */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-[#96969F] uppercase tracking-wider">Fill</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selectedElement.fillColor}
                          onChange={e => updateDesignElement(selectedElement.id, { fillColor: e.target.value, fillType: 'solid' })}
                          className="w-6 h-6 rounded-[5px] border border-[rgba(255,255,255,0.08)] bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElement.fillColor}
                          onChange={e => updateDesignElement(selectedElement.id, { fillColor: e.target.value })}
                          className="bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2 py-1 text-[#F5F5F7] font-mono flex-1 text-[11px] uppercase"
                        />
                      </div>
                    </div>

                    {/* Corner Radius */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-[#96969F] uppercase tracking-wider">Corner Radius</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={selectedElement.corners.topLeft}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            updateDesignElement(selectedElement.id, {
                              corners: { topLeft: val, topRight: val, bottomRight: val, bottomLeft: val, isLinked: true },
                            });
                          }}
                          className="flex-1 accent-[#8B7CFF]"
                        />
                        <span className="font-mono text-[#F5F5F7] text-[11px] w-6 text-right">{selectedElement.corners.topLeft}px</span>
                      </div>
                    </div>

                    {/* Opacity */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-[#96969F] uppercase tracking-wider">Opacity</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={selectedElement.opacity}
                          onChange={e => updateDesignElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                          className="flex-1 accent-[#8B7CFF]"
                        />
                        <span className="font-mono text-[#F5F5F7] text-[11px] w-8 text-right">{Math.round(selectedElement.opacity * 100)}%</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-[#96969F]">
                    <p className="text-xs">No element selected</p>
                    <p className="text-[11px] mt-1 text-[#686873]">Click any shape on the canvas to inspect</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'layers' && (
              <div className="space-y-1">
                {designElements.map(el => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedDesignElementId(el.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] cursor-pointer text-xs transition-colors ${
                      el.id === selectedDesignElementId
                        ? 'bg-[#202126] text-[#8B7CFF] border border-[rgba(255,255,255,0.06)]'
                        : 'text-zinc-400 hover:bg-[#202126] hover:text-[#F5F5F7]'
                    }`}
                  >
                    <span className="truncate">{el.name}</span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        removeDesignElement(el.id);
                      }}
                      className="p-0.5 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-[#96969F] uppercase">CSS Output</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCss);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="text-[10px] text-[#8B7CFF] hover:underline"
                    >
                      {copiedCode ? 'Copied' : 'Copy CSS'}
                    </button>
                  </div>
                  <pre className="bg-[#101114] border border-[rgba(255,255,255,0.08)] p-2 rounded-[6px] font-mono text-[10px] text-[#8B7CFF] overflow-x-auto max-h-36">
                    {generatedCss}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-[#96969F] uppercase">SVG Output</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedSvg)}
                      className="text-[10px] text-[#8B7CFF] hover:underline"
                    >
                      Copy SVG
                    </button>
                  </div>
                  <pre className="bg-[#101114] border border-[rgba(255,255,255,0.08)] p-2 rounded-[6px] font-mono text-[10px] text-zinc-300 overflow-x-auto max-h-36">
                    {generatedSvg}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
