
import React, { useState, useEffect } from 'react';
import { PenTool, Calendar, Star, MoreVertical, Search, Save, Trash2, Clock, Sparkles, Loader2, Plus, Brain, CheckCircle, BrainCircuit, AlertCircle, ChevronRight } from 'lucide-react';
import { enhanceNote, NoteEnhancement } from '../services/geminiService';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  nextReviewDate: number; // timestamp
  enhancement?: NoteEnhancement;
}

const Notetaker: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Load notes on mount
  useEffect(() => {
    const saved = localStorage.getItem('edu_notes');
    if (saved) {
      setNotes(JSON.parse(saved));
    } else {
      // Default notes if empty
      const defaultNotes: Note[] = [
        { 
          id: '1', 
          title: 'Introduction to React', 
          content: 'Hooks are essential for state management. UseState and useEffect are the bread and butter of modern React components.', 
          date: new Date().toLocaleDateString(), 
          nextReviewDate: Date.now() - 1000 // Already due for demo
        },
      ];
      setNotes(defaultNotes);
      localStorage.setItem('edu_notes', JSON.stringify(defaultNotes));
    }
  }, []);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const saveToStorage = (updatedNotes: Note[]) => {
    localStorage.setItem('edu_notes', JSON.stringify(updatedNotes));
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      date: new Date().toLocaleDateString(),
      nextReviewDate: Date.now() + 86400000 // Review tomorrow
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    setActiveNoteId(newNote.id);
    saveToStorage(updated);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    const updated = notes.map(n => n.id === id ? { ...n, ...updates } : n);
    setNotes(updated);
    saveToStorage(updated);
  };

  const handleDeleteNote = (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    if (activeNoteId === id) setActiveNoteId(null);
    saveToStorage(updated);
  };

  const handleEnhanceWithAI = async () => {
    if (!activeNote || !activeNote.content.trim()) return;
    setIsEnhancing(true);
    try {
      const result = await enhanceNote(activeNote.content);
      handleUpdateNote(activeNote.id, { enhancement: result });
    } catch (err) {
      console.error("Enhancement failed", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleMarkAsReviewed = () => {
    if (!activeNote) return;
    // Simple spaced repetition logic: Push review 3 days further each time
    const nextDate = Date.now() + (86400000 * 3);
    handleUpdateNote(activeNote.id, { nextReviewDate: nextDate });
  };

  const isReviewDue = (timestamp: number) => timestamp < Date.now();

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dueTodayNotes = filteredNotes.filter(n => isReviewDue(n.nextReviewDate));
  const libraryNotes = filteredNotes.filter(n => !isReviewDue(n.nextReviewDate));

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
            <PenTool className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Smart Notetaker</h1>
            <p className="text-slate-500 font-bold">Adaptive AI review engine for your knowledge base.</p>
          </div>
        </div>
        <button 
          onClick={handleCreateNote}
          className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-95"
        >
          <Plus className="w-5 h-5" /> New Note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[calc(100vh-220px)] overflow-hidden">
        {/* Note List Sidebar */}
        <div className="md:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 relative">
            <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts..." 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-500 outline-none text-sm font-bold transition-all"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
            {/* Review Due Section */}
            {dueTodayNotes.length > 0 && (
              <div className="space-y-3">
                <div className="px-3 flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Review Due Today
                  </h4>
                  <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {dueTodayNotes.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {dueTodayNotes.map(note => (
                    <NoteListItem 
                      key={note.id} 
                      note={note} 
                      isActive={activeNoteId === note.id} 
                      isDue={true}
                      onClick={() => setActiveNoteId(note.id)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Base Section */}
            <div className="space-y-3">
              <div className="px-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Knowledge Base</h4>
              </div>
              <div className="space-y-1">
                {libraryNotes.length === 0 && dueTodayNotes.length === 0 ? (
                  <div className="p-10 text-center opacity-30">
                    <Brain className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-black text-[10px] uppercase tracking-widest">No matching nodes</p>
                  </div>
                ) : (
                  libraryNotes.map(note => (
                    <NoteListItem 
                      key={note.id} 
                      note={note} 
                      isActive={activeNoteId === note.id} 
                      isDue={false}
                      onClick={() => setActiveNoteId(note.id)} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Note Editor Area */}
        <div className="md:col-span-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
          {activeNote ? (
            <>
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <input 
                  value={activeNote.title}
                  onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                  placeholder="Enter Topic Title"
                  className="text-2xl font-black text-slate-900 outline-none bg-transparent w-full"
                />
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleEnhanceWithAI}
                    disabled={isEnhancing || !activeNote.content}
                    className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-100 transition-all disabled:opacity-30"
                  >
                    {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isEnhancing ? 'Analyzing...' : 'AI Enhance'}
                  </button>
                  <button 
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-7 space-y-6">
                    <textarea 
                      value={activeNote.content}
                      onChange={(e) => handleUpdateNote(activeNote.id, { content: e.target.value })}
                      className="w-full h-[300px] outline-none text-slate-700 text-lg leading-[1.6] resize-none bg-transparent font-medium"
                      placeholder="Start capturing your insights here..."
                    />
                    
                    {activeNote.enhancement && (
                      <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3 mb-6">
                           <BrainCircuit className="w-6 h-6 text-indigo-300" />
                           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300">Neural Summary</h4>
                        </div>
                        <p className="text-sm font-bold leading-relaxed mb-8 opacity-90">
                          {activeNote.enhancement.summary}
                        </p>
                        
                        <div className="space-y-4">
                           <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-200">Key Concepts Identified</h5>
                           <div className="flex flex-wrap gap-2">
                             {activeNote.enhancement.keyConcepts.map((c, i) => (
                               <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-black">{c}</span>
                             ))}
                           </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-5 space-y-8">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                         <Clock className="w-4 h-4" /> Spaced Repetition
                       </h4>
                       <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Status</span>
                            {isReviewDue(activeNote.nextReviewDate) ? (
                              <span className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest bg-red-50 px-3 py-1 rounded-md border border-red-100">
                                Due Now
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                                Scheduled
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Next Review</span>
                            <span className="text-xs font-black text-slate-900">
                              {new Date(activeNote.nextReviewDate).toLocaleDateString()}
                            </span>
                          </div>

                          <button 
                            onClick={handleMarkAsReviewed}
                            className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all flex items-center justify-center gap-3 shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Reviewed
                          </button>
                       </div>
                    </div>

                    <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100/50">
                       <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                         <Star className="w-4 h-4" /> Mastery Level
                       </h4>
                       <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                            <div key={star} className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              (activeNote.enhancement?.suggestedDifficulty || 0) >= star ? 'bg-amber-400 text-white' : 'bg-white text-amber-100'
                            }`}>
                               <Star className="w-4 h-4 fill-current" />
                            </div>
                          ))}
                       </div>
                       <p className="mt-4 text-[10px] font-bold text-amber-700/60 leading-tight">
                         AI estimates this topic complexity based on your captures.
                       </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between px-8">
                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Last Modified: {activeNote.date}</span>
                  <span>•</span>
                  <span>Words: {activeNote.content.split(/\s+/).filter(Boolean).length}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud Sync Active
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
               <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-slate-200">
                 <PenTool className="w-12 h-12" />
               </div>
               <h3 className="text-xl font-black text-slate-900 mb-2">Knowledge Management</h3>
               <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm">
                 Select a memory node from the library or create a new session to begin.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface NoteListItemProps {
  note: Note;
  isActive: boolean;
  isDue: boolean;
  onClick: () => void;
}

const NoteListItem: React.FC<NoteListItemProps> = ({ note, isActive, isDue, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full p-5 text-left rounded-2xl transition-all group ${
      isActive 
        ? isDue ? 'bg-red-500 text-white shadow-xl shadow-red-100' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
        : isDue ? 'bg-white border border-red-100 hover:border-red-300 text-slate-900' : 'hover:bg-slate-50 text-slate-900'
    }`}
  >
    <div className="flex justify-between items-start mb-1.5">
      <h3 className="font-black truncate max-w-[180px] text-sm">{note.title || 'Untitled'}</h3>
      {isDue && (
        <span className={`w-2 h-2 rounded-full animate-pulse ${isActive ? 'bg-white' : 'bg-red-500'}`} />
      )}
    </div>
    <p className={`text-[10px] line-clamp-1 leading-relaxed mb-3 font-bold ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
      {note.content || 'Empty note...'}
    </p>
    <div className="flex items-center justify-between">
       <span className={`text-[8px] font-black uppercase tracking-wider flex items-center gap-2 ${isActive ? 'text-white/60' : 'text-slate-300'}`}>
         <Calendar className="w-3 h-3" /> {note.date}
       </span>
       {isActive && <ChevronRight className="w-3 h-3 text-white/40" />}
    </div>
  </button>
);

export default Notetaker;
