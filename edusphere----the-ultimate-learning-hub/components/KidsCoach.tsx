
import React, { useState, useEffect } from 'react';
import { Gamepad2, Stars, Trophy, Brain, ArrowRight, Lightbulb, CheckCircle2, XCircle, RefreshCw, Loader2, Sparkles, Zap, Rocket, Sprout, Medal } from 'lucide-react';
import { generateLogicPuzzle, LogicPuzzle } from '../services/geminiService';

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'genius' | 'olympiad';

const KidsCoach: React.FC = () => {
  const [gameState, setGameState] = useState<'selecting' | 'playing'>('selecting');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<LogicPuzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const getDifficultyLevel = (diff: Difficulty) => {
    switch (diff) {
      case 'beginner': return 1;
      case 'intermediate': return 4;
      case 'advanced': return 7;
      case 'genius': return 10;
      case 'olympiad': return 12; // Triggers Pro model logic in service
      default: return 1;
    }
  };

  const fetchNewPuzzle = async (diff: Difficulty) => {
    setLoading(true);
    setFeedback(null);
    setSelectedOption(null);
    setShowHint(false);
    try {
      const numericLevel = getDifficultyLevel(diff);
      const puzzle = await generateLogicPuzzle(numericLevel);
      setCurrentPuzzle(puzzle);
    } catch (err) {
      console.error("Failed to load puzzle", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMission = (diff: Difficulty) => {
    setDifficulty(diff);
    setGameState('playing');
    fetchNewPuzzle(diff);
  };

  const handleOptionSelect = (opt: string) => {
    if (feedback === 'correct') return;
    setSelectedOption(opt);
    setFeedback(null);
  };

  const handleSubmit = () => {
    if (!selectedOption || !currentPuzzle) return;

    if (selectedOption === currentPuzzle.answer) {
      setFeedback('correct');
      // Exponentially higher XP for Olympiad
      let baseReward = 50;
      if (difficulty === 'olympiad') baseReward = 200;
      else if (difficulty === 'genius') baseReward = 100;
      else if (difficulty === 'advanced') baseReward = 75;

      const newXp = xp + baseReward;
      setXp(newXp);
      
      if (newXp >= level * 200) {
        setLevel(level + 1);
      }
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNext = () => {
    fetchNewPuzzle(difficulty);
  };

  const handleReset = () => {
    setGameState('selecting');
    setCurrentPuzzle(null);
  };

  if (gameState === 'selecting') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 pb-12 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-pink-100 rounded-[2.5rem] flex items-center justify-center text-pink-600 mx-auto mb-6 shadow-xl shadow-pink-100/50">
            <Gamepad2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kid Logic Coach</h1>
          <p className="text-slate-500 font-bold text-lg max-w-md mx-auto">Choose your mission difficulty and power up your neural networks!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DifficultyCard 
            title="Beginner" 
            desc="Fun & Simple Patterns" 
            icon={<Sprout className="w-8 h-8 text-emerald-500" />} 
            color="border-emerald-100 hover:border-emerald-500"
            onClick={() => handleStartMission('beginner')}
            badge="Easy"
          />
          <DifficultyCard 
            title="Intermediate" 
            desc="Brain-Boosting Sequences" 
            icon={<Rocket className="w-8 h-8 text-blue-500" />} 
            color="border-blue-100 hover:border-blue-500"
            onClick={() => handleStartMission('intermediate')}
            badge="Tricky"
          />
          <DifficultyCard 
            title="Advanced" 
            desc="Expert Logic Challenges" 
            icon={<Brain className="w-8 h-8 text-purple-500" />} 
            color="border-purple-100 hover:border-purple-500"
            onClick={() => handleStartMission('advanced')}
            badge="Hard"
          />
          <DifficultyCard 
            title="Genius" 
            desc="Mastermind Lateral Thinking" 
            icon={<Zap className="w-8 h-8 text-amber-500" />} 
            color="border-amber-100 hover:border-amber-500"
            onClick={() => handleStartMission('genius')}
            badge="Extreme"
          />
          <DifficultyCard 
            title="Olympiad" 
            desc="International Competition Standard" 
            icon={<Medal className="w-8 h-8 text-yellow-600" />} 
            color="border-yellow-200 hover:border-yellow-500 bg-yellow-50/30"
            onClick={() => handleStartMission('olympiad')}
            badge="Elite"
            isSpecial
          />
        </div>
      </div>
    );
  }

  const isOlympiad = difficulty === 'olympiad';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleReset}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className={`text-2xl font-black flex items-center gap-2 uppercase tracking-tighter ${isOlympiad ? 'text-yellow-600' : 'text-slate-900'}`}>
               {isOlympiad && <Medal className="w-6 h-6" />} Mission: {difficulty}
            </h1>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Level {level} Brain Training</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
           <div className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-3 ${isOlympiad ? 'bg-yellow-50 text-yellow-700' : 'bg-amber-50 text-amber-700'}`}>
             <Trophy className="w-5 h-5" /> {level}
           </div>
           <div className="px-5 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-sm flex items-center gap-3">
             <Stars className="w-5 h-5" /> {xp} XP
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className={`bg-white p-10 rounded-[3rem] border-4 shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col justify-center ${isOlympiad ? 'border-yellow-100' : 'border-slate-50'}`}>
             {loading ? (
               <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in">
                 <div className="relative">
                   <RefreshCw className={`w-16 h-16 animate-spin ${isOlympiad ? 'text-yellow-600' : 'text-black'}`} />
                   <div className={`absolute inset-0 w-16 h-16 border-4 rounded-full animate-ping ${isOlympiad ? 'border-yellow-500/30' : 'border-black/10'}`} />
                 </div>
                 <p className="text-black font-black uppercase tracking-[0.3em] text-[10px]">
                   {isOlympiad ? 'Accessing Olympiad Database...' : 'Assembling Neural Puzzle...'}
                 </p>
               </div>
             ) : currentPuzzle ? (
               <div className="animate-in zoom-in-95 duration-500">
                 <div className="absolute top-0 right-0 p-8">
                   <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${isOlympiad ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-50 text-slate-400'}`}>
                     <Sparkles className="w-3 h-3" /> AI {isOlympiad ? 'PRO' : 'GENERATED'}
                   </div>
                 </div>
                 <div className="mb-10">
                   <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3 ${isOlympiad ? 'text-yellow-600' : 'text-indigo-400'}`}>
                     <Zap className="w-4 h-4" /> {currentPuzzle.type}
                   </h3>
                   <p className="text-2xl md:text-3xl font-black text-slate-900 leading-[1.2] tracking-tight">
                     {currentPuzzle.question}
                   </p>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                   {currentPuzzle.options.map((opt, i) => (
                     <button 
                      key={i}
                      disabled={feedback === 'correct'}
                      onClick={() => handleOptionSelect(opt)}
                      className={`p-6 rounded-[1.5rem] border-2 transition-all text-lg font-bold flex items-center justify-between group ${
                        selectedOption === opt 
                          ? isOlympiad ? 'border-yellow-600 bg-yellow-600 text-white' : 'border-black bg-black text-white'
                          : 'border-slate-100 bg-slate-50 hover:border-black/20 hover:bg-white text-slate-800'
                      } ${feedback === 'correct' && opt !== currentPuzzle.answer ? 'opacity-30 grayscale' : ''}`}
                     >
                       <span className="flex-1 text-left">{opt}</span>
                       <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${selectedOption === opt ? 'bg-white/20' : 'bg-slate-200'}`}>
                         <span className="text-xs uppercase tracking-widest">{String.fromCharCode(65 + i)}</span>
                       </div>
                     </button>
                   ))}
                 </div>

                 {feedback && (
                   <div className={`mt-8 p-6 rounded-[1.5rem] flex items-center gap-4 animate-in slide-in-from-top-4 ${
                     feedback === 'correct' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
                   }`}>
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${feedback === 'correct' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                       {feedback === 'correct' ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                     </div>
                     <div>
                       <p className="font-black text-sm uppercase tracking-[0.1em]">
                         {feedback === 'correct' ? 'Incredible Logic!' : 'Neural Error Detected'}
                       </p>
                       <p className="text-xs font-bold opacity-70">
                         {feedback === 'correct' 
                           ? `You've mastered this ${difficulty} pattern.` 
                           : isOlympiad ? "Olympiad reasoning is tough. Re-read the constraints." : 'Analysis incorrect. Try looking at the sequence again.'}
                       </p>
                     </div>
                   </div>
                 )}

                 {showHint && !feedback && (
                   <div className="mt-6 p-6 bg-amber-50 text-amber-900 rounded-[1.5rem] border border-amber-100 text-sm font-bold flex items-start gap-4 animate-in fade-in">
                     <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
                       <Lightbulb className="w-5 h-5" />
                     </div>
                     <p className="pt-2 leading-relaxed">{currentPuzzle.hint}</p>
                   </div>
                 )}

                 <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
                   <button 
                    onClick={() => setShowHint(true)}
                    disabled={feedback === 'correct' || showHint}
                    className="flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-amber-500 transition-colors disabled:opacity-30"
                   >
                     <Lightbulb className="w-4 h-4" /> Reveal Logical Hint
                   </button>
                   
                   {feedback === 'correct' ? (
                     <button 
                      onClick={handleNext}
                      className={`px-10 py-5 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center gap-4 group ${isOlympiad ? 'bg-yellow-600 shadow-yellow-200' : 'bg-black shadow-black/20'}`}
                     >
                       Next Level <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </button>
                   ) : (
                     <button 
                      onClick={handleSubmit}
                      disabled={!selectedOption}
                      className={`px-10 py-5 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center gap-4 disabled:opacity-20 ${isOlympiad ? 'bg-yellow-600 shadow-yellow-200' : 'bg-black shadow-black/20'}`}
                     >
                       Confirm Choice <ArrowRight className="w-5 h-5" />
                     </button>
                   )}
                 </div>
               </div>
             ) : (
               <div className="text-center py-12">
                 <p className="text-slate-400 font-black uppercase tracking-[0.2em] mb-6">Quantum Connection Failed</p>
                 <button onClick={() => fetchNewPuzzle(difficulty)} className="px-10 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest">Re-Establish Stream</button>
               </div>
             )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] text-slate-900 border border-slate-100 shadow-2xl relative overflow-hidden group">
            <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 ${isOlympiad ? 'bg-yellow-400/10' : 'bg-indigo-400/10'}`} />
            
            <h4 className={`font-black text-[10px] uppercase tracking-[0.4em] mb-8 flex items-center gap-4 ${isOlympiad ? 'text-yellow-600' : 'text-indigo-600'}`}>
              <Sparkles className="w-4 h-4" /> Neural Progress
            </h4>
            <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Experience Points</span>
                  <span className="text-xs font-black text-slate-900">{xp} / {level * 200}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${isOlympiad ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                    style={{ width: `${Math.min((xp / (level * 200)) * 100, 100)}%` }} 
                  />
                </div>
                
                <div className="pt-6 space-y-4">
                   <QuestItem label="Solve 3 logic puzzles" done={xp >= 150} />
                   <QuestItem label="Master Olympiad Mode" done={difficulty === 'olympiad'} />
                   <QuestItem label="Reach Level 2" done={level >= 2} />
                </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h4 className="font-black text-[10px] uppercase tracking-[0.4em] mb-8 text-slate-400">Mastery Clusters</h4>
             <div className="grid grid-cols-3 gap-3">
               {[1,2,3,4,5,6,7,8,9].map(i => (
                 <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center font-black transition-all ${
                   i === level 
                    ? 'bg-black text-white shadow-xl shadow-black/10 scale-110' 
                    : i < level 
                      ? 'bg-emerald-50 text-emerald-500' 
                      : 'bg-slate-50 text-slate-200'
                 }`}>
                   {i < level ? <CheckCircle2 className="w-5 h-5" /> : i}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DifficultyCard: React.FC<{ 
  title: string, 
  desc: string, 
  icon: React.ReactNode, 
  color: string, 
  onClick: () => void,
  badge: string,
  isSpecial?: boolean
}> = ({ title, desc, icon, color, onClick, badge, isSpecial }) => (
  <button 
    onClick={onClick}
    className={`group p-8 bg-white rounded-[2.5rem] border-2 text-left transition-all hover:shadow-2xl hover:shadow-slate-100 hover:-translate-y-2 flex flex-col items-start gap-6 relative overflow-hidden ${color} ${isSpecial ? 'animate-pulse hover:animate-none' : ''}`}
  >
    {isSpecial && (
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none" />
    )}
    <div className="flex justify-between items-start w-full relative z-10">
      <div className={`p-5 bg-white rounded-[1.5rem] shadow-lg border border-slate-50 transition-transform group-hover:rotate-12 ${isSpecial ? 'border-yellow-200' : ''}`}>
        {icon}
      </div>
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isSpecial ? 'bg-yellow-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
        {badge}
      </span>
    </div>
    <div className="relative z-10">
      <h3 className={`text-xl font-black mb-1 ${isSpecial ? 'text-yellow-700' : 'text-slate-900'}`}>{title}</h3>
      <p className="text-slate-400 font-bold text-xs leading-tight">{desc}</p>
    </div>
    <div className="w-full pt-4 flex justify-end relative z-10">
       <div className={`w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 ${isSpecial ? 'bg-yellow-600 text-white' : 'bg-black text-white'}`}>
          <ArrowRight className="w-5 h-5" />
       </div>
    </div>
  </button>
);

const QuestItem: React.FC<{ label: string, done: boolean }> = ({ label, done }) => (
  <div className="flex items-center gap-4 group">
    <div className={`w-6 h-6 rounded-xl border-2 transition-all shrink-0 ${
      done 
        ? 'bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' 
        : 'border-slate-200 group-hover:border-indigo-500'
    } flex items-center justify-center`}>
      {done && <Check className="w-3.5 h-3.5" />}
    </div>
    <span className={`text-[11px] font-black uppercase tracking-wider ${done ? 'text-slate-400 line-through opacity-50' : 'text-slate-600'}`}>
      {label}
    </span>
  </div>
);

const Check: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default KidsCoach;
