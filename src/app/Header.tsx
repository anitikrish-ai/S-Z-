import React, { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { WorkspaceId } from '../types/project';
import { exportProjectAsZip, downloadBlob } from '../engines/export/zipExporter';
import { runSecurityAudit } from '../engines/security/scanner';
import { SozoLogo } from '../components/SozoLogo';
import {
  PenTool,
  Film,
  LayoutDashboard,
  GitGraph,
  Code2,
  ShieldCheck,
  Download,
  Save,
  Check,
  Undo2,
  Redo2,
  Sun,
  Moon,
  FolderOpen,
  Menu,
  X,
  PanelLeftClose,
  PanelRightClose,
  PanelBottom,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    metadata,
    activeWorkspace,
    setWorkspace,
    isSaving,
    saveProject,
    files,
    designElements,
    animationClips,
    pages,
    settings,
    theme,
    toggleTheme,
    undo,
    redo,
    historyPast,
    historyFuture,
    isLeftSidebarOpen,
    toggleLeftSidebar,
    isRightInspectorOpen,
    toggleRightInspector,
    isBottomDrawerOpen,
    toggleBottomDrawer,
    isMobileMenuOpen,
    toggleMobileMenu,
    loadProjectFromJson,
  } = useProjectStore();

  const [isExporting, setIsExporting] = useState(false);

  const workspaces: { id: WorkspaceId; label: string; icon: React.ReactNode }[] = [
    { id: 'design', label: 'Design', icon: <PenTool className="w-3.5 h-3.5" /> },
    { id: 'animation', label: 'Motion', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'builder', label: 'Builder', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'graph', label: 'Architecture', icon: <GitGraph className="w-3.5 h-3.5" /> },
    { id: 'code', label: 'Code', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const securityReport = runSecurityAudit(files, metadata.name);
      const fullProjectJson = {
        metadata,
        settings,
        pages,
        designElements,
        animationClips,
        files,
      };

      const zipBlob = await exportProjectAsZip({
        projectName: metadata.name,
        files,
        designElements,
        animationClips,
        securityReport,
        fullProjectJson,
      });

      downloadBlob(zipBlob, `${metadata.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-apple-export.zip`);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        loadProjectFromJson(parsed);
      } catch (err) {
        alert('Invalid CSS Studio project JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="h-11 bg-[#18191D] border-b border-[rgba(255,255,255,0.08)] px-3.5 flex items-center justify-between z-40 select-none text-xs transition-colors">
      {/* 1. Left: Apple macOS Traffic Lights & Project Info */}
      <div className="flex items-center gap-3">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-1.5 mr-1 group">
          <div className="traffic-light traffic-close cursor-pointer" title="Close" />
          <div className="traffic-light traffic-minimize cursor-pointer" title="Minimize" />
          <div className="traffic-light traffic-zoom cursor-pointer" title="Expand" />
        </div>

        {/* Panel toggle buttons */}
        <div className="hidden lg:flex items-center gap-1">
          <button
            onClick={toggleLeftSidebar}
            className={`p-1 rounded transition-colors ${
              isLeftSidebarOpen ? 'text-[#F5F5F7] bg-[#202126]' : 'text-[#96969F] hover:text-[#F5F5F7]'
            }`}
            title="Toggle Left Tool Rail"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleBottomDrawer}
            className={`p-1 rounded transition-colors ${
              isBottomDrawerOpen ? 'text-[#F5F5F7] bg-[#202126]' : 'text-[#96969F] hover:text-[#F5F5F7]'
            }`}
            title="Toggle Bottom Console / Timeline Drawer"
          >
            <PanelBottom className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleRightInspector}
            className={`p-1 rounded transition-colors ${
              isRightInspectorOpen ? 'text-[#F5F5F7] bg-[#202126]' : 'text-[#96969F] hover:text-[#F5F5F7]'
            }`}
            title="Toggle Inspector"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-3.5 w-[1px] bg-[rgba(255,255,255,0.08)] mx-0.5 hidden sm:block" />

        {/* Studio Branding */}
        <div className="flex items-center gap-2.5">
          <img
            src="/sozo-logo.png"
            alt="SŌZŌ Studio"
            className="h-7 w-auto object-contain select-none"
          />
          <span className="text-[11px] text-[#686873] font-normal hidden lg:inline">
            / {metadata.name}
          </span>
        </div>

        {/* Save Status */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#96969F]">
          {isSaving ? (
            <span className="text-[#8B7CFF] font-medium animate-pulse text-[10px]">Saving...</span>
          ) : (
            <span className="flex items-center gap-1 text-[#30D18A]">
              <Check className="w-3 h-3" />
              <span className="text-[10px] text-[#96969F]">Synced</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Center: Segmented Control Workspace Switcher */}
      <nav className="hidden md:flex items-center bg-[#101114] p-0.5 rounded-[8px] border border-[rgba(255,255,255,0.08)]">
        {workspaces.map(ws => {
          const isActive = activeWorkspace === ws.id;
          return (
            <button
              key={ws.id}
              onClick={() => setWorkspace(ws.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-[#202126] text-[#F5F5F7] shadow-sm border border-[rgba(255,255,255,0.06)]'
                  : 'text-[#96969F] hover:text-[#F5F5F7] hover:bg-[#18191D]'
              }`}
            >
              {ws.icon}
              <span>{ws.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Right: Undo/Redo, Theme, Import, Export, Mobile Toggle */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5">
          <button
            onClick={undo}
            disabled={historyPast.length === 0}
            className={`p-1.5 rounded transition-colors ${
              historyPast.length > 0
                ? 'text-[#F5F5F7] hover:bg-[#202126]'
                : 'text-[#686873] cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={historyFuture.length === 0}
            className={`p-1.5 rounded transition-colors ${
              historyFuture.length > 0
                ? 'text-[#F5F5F7] hover:bg-[#202126]'
                : 'text-[#686873] cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-3.5 w-[1px] bg-[rgba(255,255,255,0.08)] mx-0.5 hidden sm:block" />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-[#96969F] hover:text-[#F5F5F7] hover:bg-[#202126] rounded transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Import JSON */}
        <label
          className="p-1.5 text-[#96969F] hover:text-[#F5F5F7] hover:bg-[#202126] rounded transition-colors cursor-pointer hidden sm:block"
          title="Import Project JSON"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <input
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />
        </label>

        {/* Export ZIP Button */}
        <button
          onClick={handleExportZip}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#8B7CFF] hover:bg-[#7A6AE6] text-white text-[11px] font-medium rounded-[7px] transition-all shadow-sm"
        >
          <Download className={`w-3 h-3 ${isExporting ? 'animate-bounce' : ''}`} />
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </button>

        {/* Mobile menu hamburger */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-1.5 text-[#F5F5F7] hover:bg-[#202126] rounded ml-1"
          title="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Workspace Drawer Modal */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-11 bg-[#101114]/95 backdrop-blur-md z-50 md:hidden p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(255,255,255,0.08)]">
              <img src="/sozo-logo.png" alt="SŌZŌ Studio" className="h-6 w-auto" />
              <span className="text-[10px] text-[#96969F] font-mono">v1.0.0</span>
            </div>
            <div className="text-[11px] font-semibold text-[#96969F] uppercase tracking-wider mb-2">
              Workspaces
            </div>
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => setWorkspace(ws.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeWorkspace === ws.id
                    ? 'bg-[#202126] text-[#8B7CFF] border border-[rgba(255,255,255,0.08)]'
                    : 'text-[#F5F5F7] hover:bg-[#18191D]'
                }`}
              >
                {ws.icon}
                <span>{ws.label} Studio</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-2">
            <button
              onClick={handleExportZip}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-[#8B7CFF] text-white font-medium rounded-lg text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project ZIP</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
