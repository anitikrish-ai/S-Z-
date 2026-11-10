import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { AnimationClip, AnimatableProperty, KeyframePoint } from '../../types/animation';
import { animationClipToCssKeyframes } from '../../utils/css';
import { generateId } from '../../utils/id';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Clock,
  Layers,
  Code,
  Copy,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const AnimationLab: React.FC = () => {
  const { animationClips, activeClipId, updateAnimationClip, setActiveClipId } = useProjectStore();

  const currentClip = animationClips.find(c => c.id === activeClipId) || animationClips[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<'timeline' | 'css'>('timeline');
  const [copiedCss, setCopiedCss] = useState(false);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Playback animation frame loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    lastTickTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTickTimeRef.current) * playbackSpeed;
      lastTickTimeRef.current = now;

      setCurrentTimeMs(prev => {
        const nextTime = prev + delta;
        if (nextTime >= currentClip.durationMs) {
          if (currentClip.iterationCount === 'infinite') {
            return 0;
          } else {
            setIsPlaying(false);
            return currentClip.durationMs;
          }
        }
        return nextTime;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, currentClip.durationMs, currentClip.iterationCount]);

  // Interpolate property values at current playhead
  const getInterpolatedValue = (property: AnimatableProperty): number | string => {
    const track = currentClip.tracks.find(t => t.property === property);
    if (!track || track.keyframes.length === 0) return track?.defaultValue ?? 0;

    const sorted = [...track.keyframes].sort((a, b) => a.timeMs - b.timeMs);
    if (currentTimeMs <= sorted[0].timeMs) return sorted[0].value;
    if (currentTimeMs >= sorted[sorted.length - 1].timeMs) return sorted[sorted.length - 1].value;

    for (let i = 0; i < sorted.length - 1; i++) {
      const k1 = sorted[i];
      const k2 = sorted[i + 1];
      if (currentTimeMs >= k1.timeMs && currentTimeMs <= k2.timeMs) {
        const progress = (currentTimeMs - k1.timeMs) / (k2.timeMs - k1.timeMs);
        if (typeof k1.value === 'number' && typeof k2.value === 'number') {
          return k1.value + (k2.value - k1.value) * progress;
        }
        return progress > 0.5 ? k2.value : k1.value;
      }
    }
    return sorted[0].value;
  };

  const handleAddKeyframe = (trackId: string) => {
    const track = currentClip.tracks.find(t => t.id === trackId);
    if (!track) return;

    const currentVal = getInterpolatedValue(track.property);
    const newKf: KeyframePoint = {
      id: generateId('kf'),
      timeMs: Math.round(currentTimeMs),
      value: currentVal,
      easing: 'ease-in-out',
    };

    const updatedTracks = currentClip.tracks.map(t => {
      if (t.id === trackId) {
        const filtered = t.keyframes.filter(k => Math.abs(k.timeMs - currentTimeMs) > 10);
        return { ...t, keyframes: [...filtered, newKf].sort((a, b) => a.timeMs - b.timeMs) };
      }
      return t;
    });

    updateAnimationClip(currentClip.id, { tracks: updatedTracks });
  };

  const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = timelineContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    const newTime = Math.round(ratio * currentClip.durationMs);
    setCurrentTimeMs(newTime);
  };

  const { keyframesCss, animationRule } = animationClipToCssKeyframes(currentClip);

  const liveTranslateX = Number(getInterpolatedValue('translateX')) || 0;
  const liveTranslateY = Number(getInterpolatedValue('translateY')) || 0;
  const liveRotate = Number(getInterpolatedValue('rotate')) || 0;
  const liveOpacity = Number(getInterpolatedValue('opacity')) ?? 1;

  return (
    <div className="flex flex-col h-full w-full bg-[#101114] text-[#F5F5F7] overflow-hidden">
      {/* 1. Motion Lab Header Bar */}
      <header className="h-10 bg-[#18191D] border-b border-[rgba(255,255,255,0.08)] px-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[#96969F] text-[11px] font-medium">Clip:</span>
          <select
            value={currentClip.id}
            onChange={e => setActiveClipId(e.target.value)}
            className="bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2.5 py-1 text-[#F5F5F7] font-medium outline-none text-[11px]"
          >
            {animationClips.map(clip => (
              <option key={clip.id} value={clip.id}>
                {clip.name} ({clip.durationMs}ms)
              </option>
            ))}
          </select>

          <div className="h-3.5 w-[1px] bg-[rgba(255,255,255,0.08)] mx-1" />

          {/* Timecode & Playback */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setCurrentTimeMs(0);
                setIsPlaying(false);
              }}
              className="p-1 text-[#96969F] hover:text-[#F5F5F7] rounded hover:bg-[#202126]"
              title="Return to Zero"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 bg-[#8B7CFF] text-white rounded-[5px] hover:bg-[#7A6AE6] transition-colors"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <span className="font-mono text-[#F5F5F7] text-[11px] ml-1.5 w-14 text-center">
              {(currentTimeMs / 1000).toFixed(2)}s
            </span>
            <span className="text-[#686873]">/</span>
            <span className="font-mono text-[#96969F] text-[11px] w-12">
              {(currentClip.durationMs / 1000).toFixed(2)}s
            </span>
          </div>

          <div className="h-3.5 w-[1px] bg-[rgba(255,255,255,0.08)] mx-1" />

          {/* Speed Presets */}
          <div className="flex items-center gap-1">
            {[0.5, 1, 1.5, 2].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono transition-colors ${
                  playbackSpeed === speed ? 'bg-[#202126] text-[#8B7CFF] font-semibold' : 'text-[#96969F] hover:text-[#F5F5F7]'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-2.5 py-1 rounded-[5px] text-[11px] transition-colors ${
              activeTab === 'timeline' ? 'bg-[#202126] text-[#8B7CFF] font-medium' : 'text-[#96969F] hover:text-[#F5F5F7]'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`px-2.5 py-1 rounded-[5px] text-[11px] transition-colors ${
              activeTab === 'css' ? 'bg-[#202126] text-[#8B7CFF] font-medium' : 'text-[#96969F] hover:text-[#F5F5F7]'
            }`}
          >
            Keyframe Code
          </button>
        </div>
      </header>

      {/* 2. Motion Stage Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Stage */}
        <div className="flex-1 bg-[#101114] flex flex-col items-center justify-center p-8 relative canvas-dots-pattern">
          {/* Target Element */}
          <div
            className="w-60 h-36 bg-[#18191D] border border-[rgba(255,255,255,0.09)] rounded-[12px] p-4 shadow-xl flex flex-col justify-between select-none"
            style={{
              transform: `translate(${liveTranslateX}px, ${liveTranslateY}px) rotate(${liveRotate}deg)`,
              opacity: liveOpacity,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#8B7CFF] tracking-wider uppercase">Motion Target</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#30D18A]" />
            </div>

            <div>
              <div className="text-xs font-semibold text-[#F5F5F7]">Interpolated Motion State</div>
              <div className="text-[10px] text-[#96969F] mt-0.5 font-mono">
                ΔY: {Math.round(liveTranslateY)}px · Opacity: {liveOpacity.toFixed(2)}
              </div>
            </div>

            <div className="w-full bg-[#202126] h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#8B7CFF] h-full transition-all duration-75"
                style={{ width: `${(currentTimeMs / currentClip.durationMs) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Clip Settings Sidebar */}
        <aside className="w-64 bg-[#18191D] border-l border-[rgba(255,255,255,0.08)] p-3.5 space-y-3.5 text-xs overflow-y-auto">
          <div className="font-semibold text-[#F5F5F7] text-[11px] uppercase tracking-wider">Motion Parameters</div>

          <div className="space-y-1">
            <label className="text-[#96969F] text-[10px]">Duration (ms)</label>
            <input
              type="number"
              step="100"
              min="200"
              max="10000"
              value={currentClip.durationMs}
              onChange={e => updateAnimationClip(currentClip.id, { durationMs: parseInt(e.target.value) || 1000 })}
              className="w-full bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2 py-1 text-[#F5F5F7] font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#96969F] text-[10px]">Easing Function</label>
            <div className="text-[11px] text-[#8B7CFF] font-mono bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px] p-2">
              cubic-bezier(0.16, 1, 0.3, 1)
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#96969F] text-[10px]">Direction</label>
            <select
              value={currentClip.direction}
              onChange={e => updateAnimationClip(currentClip.id, { direction: e.target.value as any })}
              className="w-full bg-[#101114] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2 py-1 text-[#F5F5F7] text-[11px]"
            >
              <option value="alternate">Alternate</option>
              <option value="normal">Normal</option>
              <option value="reverse">Reverse</option>
            </select>
          </div>
        </aside>
      </div>

      {/* 3. Bottom Motion Timeline Panel */}
      <div className="h-56 bg-[#18191D] border-t border-[rgba(255,255,255,0.08)] flex flex-col">
        {activeTab === 'timeline' ? (
          <>
            {/* Scrubber Bar */}
            <div className="h-7 bg-[#101114] border-b border-[rgba(255,255,255,0.08)] flex items-center px-3.5">
              <div className="w-40 text-[10px] font-semibold text-[#96969F] uppercase tracking-wider">Tracks</div>
              <div
                ref={timelineContainerRef}
                onClick={handleTimelineScrub}
                className="flex-1 h-full relative cursor-pointer flex items-center"
              >
                <div className="w-full h-full flex justify-between items-center text-[9px] text-[#686873] font-mono select-none px-1">
                  <span>0ms</span>
                  <span>{Math.round(currentClip.durationMs * 0.25)}ms</span>
                  <span>{Math.round(currentClip.durationMs * 0.5)}ms</span>
                  <span>{Math.round(currentClip.durationMs * 0.75)}ms</span>
                  <span>{currentClip.durationMs}ms</span>
                </div>

                <div
                  className="absolute top-0 bottom-0 w-[1.5px] bg-[#8B7CFF] z-20 pointer-events-none"
                  style={{ left: `${(currentTimeMs / currentClip.durationMs) * 100}%` }}
                >
                  <div className="w-2 h-2 bg-[#8B7CFF] -ml-[3px] rounded-[1px] rotate-45" />
                </div>
              </div>
            </div>

            {/* Tracks List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[rgba(255,255,255,0.04)]">
              {currentClip.tracks.map(track => (
                <div key={track.id} className="h-10 flex items-center px-3.5 hover:bg-[#202126]/40 transition-colors">
                  <div className="w-40 flex items-center justify-between pr-3">
                    <span className="text-[11px] font-medium text-[#F5F5F7]">{track.label}</span>
                    <button
                      onClick={() => handleAddKeyframe(track.id)}
                      className="p-0.5 text-[#8B7CFF] hover:bg-[#8B7CFF]/15 rounded text-[9px] flex items-center gap-0.5"
                      title="Add Keyframe at playhead"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Key</span>
                    </button>
                  </div>

                  <div className="flex-1 h-5 bg-[#101114] rounded-[4px] relative flex items-center px-1">
                    {track.keyframes.map(kf => {
                      const leftPercent = (kf.timeMs / currentClip.durationMs) * 100;
                      return (
                        <div
                          key={kf.id}
                          style={{ left: `${leftPercent}%` }}
                          className="absolute w-2.5 h-2.5 -ml-1.5 bg-[#8B7CFF] border border-white rounded-[1px] rotate-45 cursor-pointer hover:scale-125 transition-transform"
                          title={`${kf.timeMs}ms: ${kf.value}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-3.5 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-[#96969F]">Exported CSS Keyframes</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${keyframesCss}\n\n${animationRule}`);
                  setCopiedCss(true);
                  setTimeout(() => setCopiedCss(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] text-[#8B7CFF] hover:underline"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedCss ? 'Copied' : 'Copy Keyframes'}</span>
              </button>
            </div>
            <pre className="flex-1 bg-[#101114] border border-[rgba(255,255,255,0.08)] p-2.5 rounded-[6px] font-mono text-[10px] text-[#8B7CFF] overflow-auto">
              {keyframesCss}
              {'\n\n/* Usage Rule */\n'}
              {animationRule}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
