import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useProjectStore } from '../../store/useProjectStore';
import {
  FileCode,
  RotateCw,
  Terminal,
  Columns,
  Eye,
} from 'lucide-react';

export const CodeStudio: React.FC = () => {
  const { files, activeFileId, setActiveFileId, updateFile, syncCodeFromVisual, isLeftSidebarOpen } = useProjectStore();

  const [showPreview, setShowPreview] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[SŌZŌ Studio] Workspace synchronized with visual components.',
    '[Vite Runtime] Isolated DOM preview active.',
  ]);

  const currentFile = files[activeFileId] || Object.values(files)[0];

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && currentFile) {
      updateFile(currentFile.id, value);
    }
  };

  const htmlContent = files['file_html']?.content || '';
  const cssContent = files['file_css']?.content || '';
  const jsContent = files['file_js']?.content || '';

  const previewSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent.replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/i, '').replace(/<\/body>[\s\S]*?<\/html>/i, '')}
        <script>
          ${jsContent}
        </script>
      </body>
    </html>
  `;

  return (
    <div className="flex h-full w-full bg-[#101114] text-[#F5F5F7] overflow-hidden">
      {/* 1. Left Project File Explorer */}
      {isLeftSidebarOpen && (
        <aside className="w-56 bg-[#18191D] border-r border-[rgba(255,255,255,0.08)] flex flex-col h-full text-xs z-20">
          <div className="h-9 border-b border-[rgba(255,255,255,0.08)] px-3 flex items-center justify-between font-semibold text-[#F5F5F7] text-[11px]">
            <span className="uppercase text-[10px] text-[#96969F] tracking-wider">Explorer</span>
            <button
              onClick={() => syncCodeFromVisual()}
              className="p-1 text-[#8B7CFF] hover:bg-[#202126] rounded transition-colors"
              title="Resync Code"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {Object.values(files).map(file => (
              <div
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] cursor-pointer text-[11px] transition-colors ${
                  file.id === currentFile?.id
                    ? 'bg-[#202126] text-[#8B7CFF] font-medium border border-[rgba(255,255,255,0.06)]'
                    : 'text-zinc-400 hover:bg-[#202126] hover:text-[#F5F5F7]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-[#8B7CFF]" />
                <span className="truncate">{file.name}</span>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-[rgba(255,255,255,0.08)] text-[10px] text-[#686873]">
            Two-way sync: edits here reflect across studio workspaces.
          </div>
        </aside>
      )}

      {/* 2. Monaco Editor & Tabs */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Editor Tabs & Controls */}
        <div className="h-9 bg-[#18191D] border-b border-[rgba(255,255,255,0.08)] px-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            {Object.values(files).map(file => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`px-3 py-1 rounded-[5px] text-[11px] flex items-center gap-1.5 transition-colors ${
                  file.id === currentFile?.id
                    ? 'bg-[#101114] text-[#F5F5F7] border border-[rgba(255,255,255,0.08)]'
                    : 'text-zinc-400 hover:text-white hover:bg-[#202126]'
                }`}
              >
                <span className="font-mono">{file.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] transition-colors ${
              showPreview ? 'bg-[#202126] text-[#8B7CFF]' : 'text-[#96969F] hover:text-[#F5F5F7]'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>Split Preview</span>
          </button>
        </div>

        {/* Editor & Split Preview Viewport */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 h-full overflow-hidden bg-[#101114]">
            {currentFile && (
              <Editor
                height="100%"
                language={currentFile.language}
                value={currentFile.content}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                  fontSize: 12.5,
                  fontFamily: 'JetBrains Mono, Menlo, SF Mono, monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  lineNumbers: 'on',
                  tabSize: 2,
                  automaticLayout: true,
                  padding: { top: 10 },
                }}
              />
            )}
          </div>

          {showPreview && (
            <div className="w-1/2 border-l border-[rgba(255,255,255,0.08)] flex flex-col h-full bg-[#18191D]">
              <div className="h-7 border-b border-[rgba(255,255,255,0.08)] px-3 flex items-center justify-between text-[10px] text-[#96969F] font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3 h-3 text-[#30D18A]" />
                  <span>Sandbox Preview</span>
                </div>
                <span className="font-mono text-[#686873]">Render Frame</span>
              </div>
              <div className="flex-1 bg-white">
                <iframe
                  title="Studio Live Preview"
                  srcDoc={previewSrcDoc}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-modals"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Console Drawer */}
        <div className="h-24 bg-[#18191D] border-t border-[rgba(255,255,255,0.08)] flex flex-col text-xs font-mono">
          <div className="h-6 px-3 bg-[#101114] border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between text-[10px] text-[#96969F]">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-[#8B7CFF]" />
              <span className="font-semibold uppercase tracking-wider">Console & Diagnostics</span>
            </div>
            <button onClick={() => setConsoleLogs([])} className="hover:text-white">
              Clear
            </button>
          </div>
          <div className="flex-1 p-2 overflow-y-auto space-y-0.5 text-zinc-300 text-[10px]">
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[#686873] select-none">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
