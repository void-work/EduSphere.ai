
import React, { useState } from 'react';
import { generateStudyMaterial } from '../services/geminiService';
import { Flashcard, QuizQuestion } from '../types';
import { Loader2, Plus, CheckCircle2, BookOpen, GraduationCap, Bookmark, Info, ListFilter, Search, AlertCircle } from 'lucide-react';

const TextbookCompanion: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [className, setClassName] = useState('');
  const [textbookName, setTextbookName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [material, setMaterial] = useState<{ flashcards: Flashcard[], quiz: QuizQuestion[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');

  const handleProcess = async () => {
    if (!inputText.trim() || !className.trim() || !textbookName.trim()) {
      setError("Please fill in the Class, Textbook Name, and Chapter Content.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setMaterial(null);
    
    try {
      const result = await generateStudyMaterial(inputText, className, textbookName);
      if (result.flashcards.length === 0) {
        throw new Error("No flashcards could be extracted. Try providing more detailed text.");
      }
      setMaterial(result);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "An unexpected error occurred while generating materials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Textbook Companion</h1>
            <p className="text-slate-500 font-bold">Deep context analysis and atomic fact extraction.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Academic Course / Class</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <input 
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. History of Rome"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Textbook Name</label>
            <div className="relative">
              <Bookmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <input 
                value={textbookName}
                onChange={(e) => setTextbookName(e.target.value)}
                placeholder="e.g. SPQR: A History of Ancient Rome"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Chapter Content to Analyze</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste raw text from your textbook or lecture notes here..."
            className="w-full h-56 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none font-medium text-slate-700 leading-relaxed transition-all"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">System Error</p>
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleProcess}
          disabled={loading || !inputText || !className || !textbookName}
          className="flex items-center justify-center gap-4 w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 disabled:opacity-30 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Synthesizing Study Kit...
            </>
          ) : (
            <>
              <Plus className="w-6 h-6" />
              Generate Comprehensive Study Pack
            </>
          )}
        </button>
      </div>

      {material && (
        <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl">
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activeTab === 'flashcards' 
                    ? 'bg-white text-indigo-600 shadow-md translate-y-[-2px]' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Flashcards ({material.flashcards.length})
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  activeTab === 'quiz' 
                    ? 'bg-white text-indigo-600 shadow-md translate-y-[-2px]' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Quiz Mastery ({material.quiz.length})
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
               <CheckCircle2 className="w-4 h-4" /> Comprehensive Coverage
            </div>
          </div>

          {activeTab === 'flashcards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {material.flashcards.map((card, i) => (
                <div key={i} className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-indigo-500 hover:shadow-2xl transition-all flex flex-col h-full shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <BookOpen className="w-24 h-24 -rotate-12" />
                  </div>
                  
                  <div className="relative z-10 flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[8px] font-black uppercase tracking-widest">Card {i + 1}</span>
                    </div>
                    <p className="text-slate-900 font-black text-xl leading-tight mb-8 font-serif italic">"{card.question}"</p>
                    
                    <div className="pt-6 border-t border-slate-50 space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Core Insight</span>
                      <p className="text-slate-700 font-bold leading-relaxed">{card.answer}</p>
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Info className="w-4 h-4 text-slate-400" />
                       </div>
                       <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Citing Section</p>
                         <p className="text-[10px] font-black text-indigo-600 truncate max-w-[150px]">{card.source}</p>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {material.quiz.map((q, i) => (
                <div key={i} className="p-12 bg-white border border-slate-100 rounded-[3rem] shadow-xl">
                  <div className="flex items-start gap-5 mb-8">
                    <span className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-lg">{i + 1}</span>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight pt-1">{q.question}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {q.options.map((opt, idx) => (
                      <div 
                        key={idx} 
                        className={`p-6 border-2 rounded-2xl text-sm font-bold transition-all flex items-center justify-between ${
                          opt === q.correctAnswer 
                            ? 'bg-emerald-50 border-emerald-500/40 text-emerald-800' 
                            : 'border-slate-50 bg-slate-50 text-slate-400'
                        }`}
                      >
                        <span className="flex-1 pr-4">{opt}</span>
                        {opt === q.correctAnswer && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />}
                      </div>
                    ))}
                  </div>

                  <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                       <GraduationCap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Deep Pedagogical Explanation</p>
                      <p className="text-indigo-900 text-sm leading-relaxed font-bold italic">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SIMPLIFIED FOOTER REFERENCE GRID */}
          <div className="mt-16 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Active Study Set</p>
                </div>
                <h3 className="text-3xl font-black tracking-tight text-slate-900">{textbookName}</h3>
                <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
                   <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {className}</span>
                   <span className="w-1 h-1 bg-slate-200 rounded-full" />
                   <span className="flex items-center gap-2"><ListFilter className="w-4 h-4" /> {material.flashcards.length} Atomic Cards</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Search className="w-3 h-3 text-indigo-500" /> Academic Citations Extracted
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from(new Set(material.flashcards.map(f => f.source))).slice(0, 12).map((source, idx) => (
                  <div key={idx} className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-600 truncate">
                    {source}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 pt-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synthesis complete • {new Date().toLocaleDateString()}</p>
               <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
               >
                 Return to Top
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextbookCompanion;
