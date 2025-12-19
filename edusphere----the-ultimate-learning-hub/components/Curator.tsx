
import React, { useState } from 'react';
import { Sparkles, Search, Loader2, BookOpen, Clock, CheckCircle2, Trophy, ArrowRight, Brain, Layers, Star } from 'lucide-react';
import { generateCuratedPath } from '../services/geminiService';
import { CuratedPath } from '../types';

const Curator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<CuratedPath | null>(null);

  const handleCuration = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const result = await generateCuratedPath(topic);
      setPath(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-50 shadow-xl">
          <Sparkles className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Curator</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Neural Synthesis & Mastery Roadmapping</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8">
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-1">Knowledge Target</label>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Advanced Quantum Mechanics, Sustainable Architecture..."
              className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-amber-500 outline-none transition-all font-black text-slate-800"
            />
          </div>
        </div>

        <button 
          onClick={handleCuration}
          disabled={loading || !topic}
          className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-30 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Synthesizing Curriculum...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-400" />
              Build Mastery Roadmap
            </>
          )}
        </button>
      </div>

      {path && (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
          {/* Path Header */}
          <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-[0.05]">
                <Brain className="w-64 h-64" />
             </div>
             <div className="relative z-10 max-w-2xl space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Curated Intelligence</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight leading-tight">{path.topic}</h2>
                <p className="text-slate-400 font-bold text-lg leading-relaxed">{path.description}</p>
             </div>
          </div>

          {/* Modules Timeline */}
          <div className="space-y-8 relative">
            <div className="absolute left-8 top-12 bottom-12 w-px bg-slate-200 hidden lg:block" />
            
            {path.modules.map((module, i) => (
              <div key={i} className="flex flex-col lg:flex-row gap-10 relative">
                {/* Timeline Marker */}
                <div className="hidden lg:flex shrink-0 w-16 h-16 bg-white border-2 border-slate-200 rounded-2xl items-center justify-center text-slate-900 font-black text-xl z-10 shadow-sm">
                   {i + 1}
                </div>
                
                <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl hover:border-amber-200 transition-all group">
                   <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="lg:hidden w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-black">{i + 1}</span>
                           <h3 className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">{module.title}</h3>
                        </div>
                        <p className="text-slate-500 font-bold leading-relaxed">{module.synthesis}</p>
                      </div>
                      <div className="shrink-0 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <Clock className="w-3 h-3" /> {module.duration}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Learning Objectives
                         </h4>
                         <ul className="space-y-3">
                            {module.objectives.map((obj, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                                 <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-2 shrink-0" />
                                 {obj}
                              </li>
                            ))}
                         </ul>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl flex flex-col justify-center border border-slate-100">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Recommendation</p>
                         <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                           This segment prioritizes foundational {module.title.toLowerCase()} concepts before proceeding to advanced applications.
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mastery Outcome */}
          <div className="bg-amber-500 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
             <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
             <div className="relative z-10 max-w-2xl space-y-6">
                <Trophy className="w-16 h-16 mx-auto mb-2 text-white" />
                <h3 className="text-3xl font-black tracking-tight">Outcome of Mastery</h3>
                <p className="text-amber-50 font-black text-lg leading-relaxed">
                  {path.masteryOutcome}
                </p>
                <div className="pt-8">
                   <button className="px-10 py-5 bg-white text-amber-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-4 mx-auto shadow-xl shadow-amber-600/20">
                      Begin Intelligence Track <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Placeholder State */}
      {!path && !loading && (
        <div className="flex flex-col items-center justify-center py-24 bg-white/40 rounded-[3rem] border border-dashed border-slate-200 opacity-40">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-50">
             <Layers className="w-8 h-8 text-slate-200" />
           </div>
           <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">Awaiting Knowledge Synthesis Target</p>
        </div>
      )}
    </div>
  );
};

export default Curator;
