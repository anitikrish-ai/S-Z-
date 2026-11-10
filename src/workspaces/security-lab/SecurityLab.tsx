import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { runSecurityAudit } from '../../engines/security/scanner';
import { SecurityAuditReport, SecurityFinding } from '../../types/security';
import {
  ShieldCheck,
  RefreshCw,
  Lock,
  FileCode,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const SecurityLab: React.FC = () => {
  const { files, metadata, updateFile, isLeftSidebarOpen } = useProjectStore();

  const [report, setReport] = useState<SecurityAuditReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<SecurityFinding | null>(null);
  const [activeTab, setActiveTab] = useState<'findings' | 'csp_generator' | 'headers'>('findings');

  const [cspScriptSrc, setCspScriptSrc] = useState("'self'");
  const [cspStyleSrc, setCspStyleSrc] = useState("'self' 'unsafe-inline'");
  const [cspImgSrc, setCspImgSrc] = useState("'self' data: https:");
  const [appliedFix, setAppliedFix] = useState(false);

  const runAudit = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = runSecurityAudit(files, metadata.name);
      setReport(res);
      setSelectedFinding(res.findings[0] || null);
      setIsScanning(false);
    }, 300);
  };

  useEffect(() => {
    runAudit();
  }, [files]);

  const handleApplyFix = (finding: SecurityFinding) => {
    if (!finding.fixSnippet) return;
    const targetFile = Object.values(files).find(f => f.path === finding.fileLocation);
    if (!targetFile) return;

    if (finding.category === 'headers' && finding.title.includes('CSP')) {
      const newContent = targetFile.content.replace(
        /<head>/i,
        `<head>\n  ${finding.fixSnippet}`
      );
      updateFile(targetFile.id, newContent);
      setAppliedFix(true);
      setTimeout(() => setAppliedFix(false), 3000);
    }
  };

  const getSeverityBadge = (sev: SecurityFinding['severity']) => {
    switch (sev) {
      case 'Critical':
        return <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-[#FF5B62]/20 text-[#FF5B62] border border-[#FF5B62]/30">CRITICAL</span>;
      case 'High':
        return <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30">HIGH</span>;
      case 'Medium':
        return <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">MEDIUM</span>;
      case 'Low':
        return <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">LOW</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-zinc-800 text-zinc-300">INFO</span>;
    }
  };

  return (
    <div className="flex h-full w-full bg-[#101114] text-[#F5F5F7] overflow-hidden">
      {/* 1. Left Findings Rail */}
      {isLeftSidebarOpen && (
        <aside className="w-80 bg-[#18191D] border-r border-[rgba(255,255,255,0.08)] flex flex-col h-full z-20 text-xs">
          {/* Audit Score Header */}
          <div className="p-3.5 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8B7CFF]" />
                <span className="font-semibold text-[#F5F5F7] text-xs">Security Posture</span>
              </div>
              <button
                onClick={runAudit}
                disabled={isScanning}
                className="flex items-center gap-1 px-2 py-0.5 bg-[#202126] hover:bg-[#282930] text-[#96969F] hover:text-[#F5F5F7] rounded-[5px] text-[10px] transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                <span>Rescan</span>
              </button>
            </div>

            {/* Score Card */}
            <div className="flex items-center justify-between p-2.5 bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[8px]">
              <div>
                <div className="text-[10px] text-[#96969F] uppercase tracking-wider font-semibold">Audit Rating</div>
                <div className="text-xl font-bold text-[#F5F5F7] mt-0.5">
                  {report ? report.score : '--'}
                  <span className="text-[10px] font-normal text-[#686873]"> / 100</span>
                </div>
              </div>
              <div
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                  (report?.score || 0) >= 80
                    ? 'border-[#30D18A] text-[#30D18A]'
                    : (report?.score || 0) >= 60
                    ? 'border-[#FF9F0A] text-[#FF9F0A]'
                    : 'border-[#FF5B62] text-[#FF5B62]'
                }`}
              >
                {(report?.score || 0) >= 80 ? 'A' : (report?.score || 0) >= 60 ? 'B' : 'C'}
              </div>
            </div>

            {/* Severity Counters */}
            <div className="grid grid-cols-4 gap-1.5 mt-2.5 text-center">
              <div className="bg-[#101114] p-1 rounded-[5px] border border-[rgba(255,255,255,0.06)]">
                <div className="text-[9px] text-[#FF5B62] font-semibold">Critical</div>
                <div className="font-bold text-white text-xs">{report?.criticalCount || 0}</div>
              </div>
              <div className="bg-[#101114] p-1 rounded-[5px] border border-[rgba(255,255,255,0.06)]">
                <div className="text-[9px] text-[#FF9F0A] font-semibold">High</div>
                <div className="font-bold text-white text-xs">{report?.highCount || 0}</div>
              </div>
              <div className="bg-[#101114] p-1 rounded-[5px] border border-[rgba(255,255,255,0.06)]">
                <div className="text-[9px] text-yellow-400 font-semibold">Medium</div>
                <div className="font-bold text-white text-xs">{report?.mediumCount || 0}</div>
              </div>
              <div className="bg-[#101114] p-1 rounded-[5px] border border-[rgba(255,255,255,0.06)]">
                <div className="text-[9px] text-blue-400 font-semibold">Low</div>
                <div className="font-bold text-white text-xs">{report?.lowCount || 0}</div>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-[rgba(255,255,255,0.08)] text-[10px]">
            <button
              onClick={() => setActiveTab('findings')}
              className={`flex-1 py-1.5 font-medium border-b transition-colors ${
                activeTab === 'findings' ? 'border-[#8B7CFF] text-[#8B7CFF] bg-[#202126]' : 'border-transparent text-[#96969F]'
              }`}
            >
              Findings ({report?.totalFindings || 0})
            </button>
            <button
              onClick={() => setActiveTab('csp_generator')}
              className={`flex-1 py-1.5 font-medium border-b transition-colors ${
                activeTab === 'csp_generator' ? 'border-[#8B7CFF] text-[#8B7CFF] bg-[#202126]' : 'border-transparent text-[#96969F]'
              }`}
            >
              CSP
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`flex-1 py-1.5 font-medium border-b transition-colors ${
                activeTab === 'headers' ? 'border-[#8B7CFF] text-[#8B7CFF] bg-[#202126]' : 'border-transparent text-[#96969F]'
              }`}
            >
              Headers
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {activeTab === 'findings' && (
              <>
                {report?.findings.length === 0 ? (
                  <div className="text-center py-10 text-[#30D18A] space-y-1.5">
                    <CheckCircle2 className="w-6 h-6 mx-auto" />
                    <p className="font-semibold text-white text-xs">No Security Risks Detected</p>
                    <p className="text-[10px] text-[#96969F]">Code satisfies baseline heuristics.</p>
                  </div>
                ) : (
                  report?.findings.map(finding => (
                    <div
                      key={finding.id}
                      onClick={() => setSelectedFinding(finding)}
                      className={`p-2.5 rounded-[6px] border cursor-pointer transition-all ${
                        selectedFinding?.id === finding.id
                          ? 'bg-[#202126] border-[#8B7CFF]'
                          : 'bg-[#101114] border-[rgba(255,255,255,0.08)] hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="font-semibold text-[#F5F5F7] truncate text-[11px]">{finding.title}</span>
                        {getSeverityBadge(finding.severity)}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-[#96969F] font-mono">
                        <FileCode className="w-2.5 h-2.5" />
                        <span className="truncate">{finding.fileLocation}</span>
                        {finding.lineNumber && <span>:{finding.lineNumber}</span>}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'csp_generator' && (
              <div className="space-y-3 p-1">
                <div className="text-[#96969F] text-[10px]">
                  Content Security Policy directives preventing XSS and frame hijacking:
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-semibold text-[#96969F]">script-src</label>
                  <input
                    type="text"
                    value={cspScriptSrc}
                    onChange={e => setCspScriptSrc(e.target.value)}
                    className="w-full bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[5px] p-1.5 text-[#F5F5F7] font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-semibold text-[#96969F]">style-src</label>
                  <input
                    type="text"
                    value={cspStyleSrc}
                    onChange={e => setCspStyleSrc(e.target.value)}
                    className="w-full bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[5px] p-1.5 text-[#F5F5F7] font-mono text-[10px]"
                  />
                </div>
              </div>
            )}

            {activeTab === 'headers' && (
              <div className="space-y-2 p-1">
                <div className="p-2 bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px]">
                  <div className="font-semibold text-[#F5F5F7] text-[11px]">Strict-Transport-Security (HSTS)</div>
                  <div className="text-[9px] text-[#96969F] font-mono mt-0.5">max-age=31536000; includeSubDomains</div>
                </div>
                <div className="p-2 bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px]">
                  <div className="font-semibold text-[#F5F5F7] text-[11px]">X-Frame-Options</div>
                  <div className="text-[9px] text-[#96969F] font-mono mt-0.5">DENY</div>
                </div>
                <div className="p-2 bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px]">
                  <div className="font-semibold text-[#F5F5F7] text-[11px]">X-Content-Type-Options</div>
                  <div className="text-[9px] text-[#96969F] font-mono mt-0.5">nosniff</div>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 2. Main Diagnostic Detail */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#101114] p-6 text-xs">
        {selectedFinding ? (
          <div className="max-w-2xl space-y-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-[#F5F5F7] tracking-tight">{selectedFinding.title}</h2>
                {getSeverityBadge(selectedFinding.severity)}
              </div>
              <div className="text-[#96969F] font-mono text-[11px] mt-1">
                File: {selectedFinding.fileLocation} {selectedFinding.lineNumber && `(line ${selectedFinding.lineNumber})`}
              </div>
            </div>

            <div className="bg-[#18191D] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-3.5 space-y-1.5">
              <h4 className="font-semibold text-[#F5F5F7] uppercase text-[10px] tracking-wider">Description</h4>
              <p className="text-[#96969F] leading-relaxed text-xs">{selectedFinding.description}</p>
            </div>

            <div className="bg-[#18191D] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-3.5 space-y-1.5">
              <h4 className="font-semibold text-[#FF9F0A] uppercase text-[10px] tracking-wider">Security Risk</h4>
              <p className="text-[#96969F] leading-relaxed text-xs">{selectedFinding.riskExplanation}</p>
            </div>

            <div className="bg-[#18191D] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#30D18A] uppercase text-[10px] tracking-wider">Remediation</h4>
                {selectedFinding.fixSnippet && (
                  <button
                    onClick={() => handleApplyFix(selectedFinding)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#8B7CFF] hover:bg-[#7A6AE6] text-white rounded-[5px] text-[10px] font-medium transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{appliedFix ? 'Applied' : 'Apply Safe Fix'}</span>
                  </button>
                )}
              </div>
              <p className="text-[#96969F] text-xs">{selectedFinding.suggestedFix}</p>

              {selectedFinding.fixSnippet && (
                <pre className="bg-[#101114] border border-[rgba(255,255,255,0.08)] p-2 rounded-[6px] font-mono text-zinc-300 text-[10px] overflow-x-auto">
                  {selectedFinding.fixSnippet}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-[#96969F] space-y-2">
            <Lock className="w-10 h-10 text-[#8B7CFF]" />
            <div className="text-sm font-semibold text-[#F5F5F7]">Security Diagnostic Suite</div>
            <p className="max-w-sm text-xs">
              Select any finding from the sidebar to inspect context and apply remediations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
