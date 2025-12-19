
import React, { useState, useRef, useEffect } from 'react';
import { Network, Search, Loader2, Sparkles, Brain, Info, ArrowRight, MousePointer2, Plus, Minus, Maximize } from 'lucide-react';
import { generateMindMapData } from '../services/geminiService';
import { MindMapNode } from '../types';

const MindMapCreator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);

  // Zoom and Pan State
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const data = await generateMindMapData(topic, content);
      setMindMapData(data);
      setSelectedNode(data);
      setZoom(0.9); // Initial fit
      setOffset({ x: 0, y: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 2));
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-100 shadow-xl">
          <Network className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">MindMap Neural</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Semantic Hierarchies & Logical Mapping</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Input Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Central Concept</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Quantum Computing..."
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Source Knowledge</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste data for semantic decomposition..."
                className="w-full h-56 p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:bg-white focus:border-indigo-500 outline-none resize-none font-medium text-slate-700 text-sm leading-relaxed transition-all"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !topic || !content}
              className="w-full py-5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-4 disabled:opacity-30 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" /> Decomposing...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Construct Neural Map
                </div>
              )}
            </button>
          </div>

          {selectedNode && (
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-indigo-100 shadow-2xl animate-in slide-in-from-left-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Node Explorer</h4>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{selectedNode.label}</h3>
              <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                {selectedNode.description || "Decomposing deep semantic details for this branch node..."}
              </p>
            </div>
          )}
        </div>

        {/* Map Workspace Area */}
        <div 
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`lg:col-span-8 bg-white/40 backdrop-blur-md rounded-[3rem] border border-slate-100 shadow-inner min-h-[700px] relative overflow-hidden flex items-center justify-center cursor-${isDragging ? 'grabbing' : 'grab'}`}
        >
          {mindMapData ? (
            <div 
              className="relative transition-transform duration-75 ease-out select-none"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
            >
              <RecursiveTree 
                node={mindMapData} 
                onNodeClick={setSelectedNode} 
                selectedId={selectedNode?.id} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-6 opacity-30 select-none">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-50">
                 <Brain className="w-10 h-10 text-slate-200" />
               </div>
               <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em]">Awaiting Intelligence Input</p>
            </div>
          )}

          {/* Floating Controls */}
          <div className="absolute top-8 right-8 flex flex-col gap-2">
            <ControlButton icon={<Plus className="w-4 h-4" />} onClick={() => adjustZoom(0.1)} title="Zoom In" />
            <ControlButton icon={<Minus className="w-4 h-4" />} onClick={() => adjustZoom(-0.1)} title="Zoom Out" />
            <ControlButton icon={<Maximize className="w-4 h-4" />} onClick={resetView} title="Reset View" />
          </div>
          
          <div className="absolute bottom-8 right-8 flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-widest bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/50 shadow-sm pointer-events-none">
             <MousePointer2 className="w-3 h-3" /> Drag to pan • Click nodes to focus
          </div>
        </div>
      </div>
    </div>
  );
};

const ControlButton: React.FC<{ icon: React.ReactNode; onClick: () => void; title: string }> = ({ icon, onClick, title }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    title={title}
    className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 shadow-sm transition-all"
  >
    {icon}
  </button>
);

const RecursiveTree: React.FC<{ 
  node: MindMapNode; 
  onNodeClick: (node: MindMapNode) => void;
  selectedId?: string;
  depth?: number;
}> = ({ node, onNodeClick, selectedId, depth = 0 }) => {
  return (
    <div className="flex flex-col items-center gap-16 group">
      {/* Current Node */}
      <button 
        onClick={(e) => { e.stopPropagation(); onNodeClick(node); }}
        className={`relative z-10 p-6 min-w-[160px] text-center rounded-[2rem] border-2 transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl ${
          selectedId === node.id 
            ? 'bg-slate-900 text-white border-slate-900 scale-110 shadow-indigo-500/20' 
            : depth === 0 
              ? 'bg-white text-slate-900 border-indigo-600' 
              : 'bg-white/90 text-slate-600 border-slate-100 hover:border-indigo-400'
        }`}
      >
        <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${selectedId === node.id ? 'text-indigo-300' : 'text-slate-300'} block mb-2`}>
          {depth === 0 ? 'Nucleus' : `Level ${depth}`}
        </span>
        <span className="font-bold tracking-tight block text-sm">{node.label}</span>
      </button>

      {/* Children Container */}
      {node.children && node.children.length > 0 && (
        <div className="flex items-start gap-12 relative pt-6 animate-in slide-in-from-top-4 duration-500">
          {/* SVG Connectors */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none -translate-y-16">
             <svg className="w-full h-full overflow-visible">
                {node.children.map((child, i) => (
                  <ConnectorLine key={i} total={node.children!.length} index={i} />
                ))}
             </svg>
          </div>
          
          {node.children.map((child) => (
            <RecursiveTree 
              key={child.id} 
              node={child} 
              onNodeClick={onNodeClick} 
              selectedId={selectedId} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ConnectorLine: React.FC<{ total: number; index: number }> = ({ total, index }) => {
  const isOnly = total === 1;
  const startX = 50;
  const startY = 0;
  const endY = 64;
  const endX = isOnly ? 50 : (index / (total - 1)) * 100;
  
  return (
    <path 
      d={`M ${startX}% ${startY} C ${startX}% ${startY + 32}, ${endX}% ${endY - 32}, ${endX}% ${endY}`} 
      fill="none" 
      stroke="rgba(99, 102, 241, 0.15)" 
      strokeWidth="2.5"
      strokeLinecap="round"
      className="transition-all duration-1000 animate-in fade-in"
    />
  );
};

export default MindMapCreator;
