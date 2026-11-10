import React, { useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { Header } from './Header';
import { DesignStudio } from '../workspaces/design-studio/DesignStudio';
import { AnimationLab } from '../workspaces/animation-lab/AnimationLab';
import { UiBuilder } from '../workspaces/ui-builder/UiBuilder';
import { WebsiteGraph } from '../workspaces/website-graph/WebsiteGraph';
import { CodeStudio } from '../workspaces/code-studio/CodeStudio';
import { SecurityLab } from '../workspaces/security-lab/SecurityLab';
import {
  Code,
  Film,
  Terminal,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeWorkspace,
    saveProject,
    settings,
    undo,
    redo,
    isBottomDrawerOpen,
    activeBottomTab,
    toggleBottomDrawer,
    setBottomTab,
  } = useProjectStore();

  // Autosave interval
  useEffect(() => {
    const timer = setInterval(() => {
      saveProject();
    }, settings.autosaveIntervalMs || 10000);

    return () => clearInterval(timer);
  }, [saveProject, settings.autosaveIntervalMs]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
      // Cmd/Ctrl + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject, undo, redo]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#101114] text-[#F5F5F7] overflow-hidden select-none">
      {/* Top macOS-style Application Toolbar */}
      <Header />

      {/* Main Workspace Canvas Router */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          {activeWorkspace === 'design' && <DesignStudio />}
          {activeWorkspace === 'animation' && <AnimationLab />}
          {activeWorkspace === 'builder' && <UiBuilder />}
          {activeWorkspace === 'graph' && <WebsiteGraph />}
          {activeWorkspace === 'code' && <CodeStudio />}
          {activeWorkspace === 'security' && <SecurityLab />}
        </div>

        {/* Apple-style Collapsible Bottom Drawer */}
        {isBottomDrawerOpen && (
          <div className="h-64 bg-[#18191D] border-t border-[rgba(255,255,255,0.08)] flex flex-col z-30 transition-all">
            {/* Drawer Header Tabs */}
            <div className="h-8 bg-[#101114] border-b border-[rgba(255,255,255,0.08)] px-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBottomTab('code')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition-colors ${
                    activeBottomTab === 'code'
                      ? 'bg-[#202126] text-[#8B7CFF]'
                      : 'text-[#96969F] hover:text-[#F5F5F7]'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>Source Preview</span>
                </button>
                <button
                  onClick={() => setBottomTab('timeline')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition-colors ${
                    activeBottomTab === 'timeline'
                      ? 'bg-[#202126] text-[#8B7CFF]'
                      : 'text-[#96969F] hover:text-[#F5F5F7]'
                  }`}
                >
                  <Film className="w-3 h-3" />
                  <span>Motion Timeline</span>
                </button>
                <button
                  onClick={() => setBottomTab('console')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition-colors ${
                    activeBottomTab === 'console'
                      ? 'bg-[#202126] text-[#8B7CFF]'
                      : 'text-[#96969F] hover:text-[#F5F5F7]'
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Diagnostics</span>
                </button>
              </div>

              <button
                onClick={toggleBottomDrawer}
                className="p-1 text-[#96969F] hover:text-[#F5F5F7] rounded"
                title="Close Drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-auto p-3 text-xs font-mono">
              {activeBottomTab === 'code' && (
                <div className="text-zinc-400 space-y-1">
                  <div className="text-[11px] text-[#8B7CFF] font-semibold">// Generated CSS Component Rules</div>
                  <pre className="text-zinc-300">
                    {`.component-surface {\n  border: 1px solid rgba(255,255,255,0.08);\n  border-radius: 10px;\n  background: #18191D;\n  box-shadow: 0 4px 16px rgba(0,0,0,0.2);\n}`}
                  </pre>
                </div>
              )}

              {activeBottomTab === 'timeline' && (
                <div className="text-zinc-400 space-y-1">
                  <div className="text-[11px] text-[#8B7CFF] font-semibold">// Active Motion Keyframes</div>
                  <div className="text-zinc-300">
                    Track: translateY (0ms: 0px → 700ms: -10px → 1400ms: 0px) [cubic-bezier(0.16, 1, 0.3, 1)]
                  </div>
                </div>
              )}

              {activeBottomTab === 'console' && (
                <div className="space-y-1 text-zinc-300">
                  <div className="text-[#30D18A]">✓ SŌZŌ Studio: Local-first IndexedDB project initialized cleanly.</div>
                  <div className="text-zinc-400">✓ Security scan: 0 critical vulnerabilities in production bundle.</div>
                  <div className="text-zinc-400">✓ Apple macOS design tokens verified with 180ms ease-out transitions.</div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
