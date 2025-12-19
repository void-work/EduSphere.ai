
import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardCheck, 
  RefreshCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  History, 
  ChevronLeft, 
  Trash2,
  AlertTriangle,
  ArrowRight,
  Pause,
  Play
} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { ExamResult, QuizQuestion } from '../types';

const TIME_PER_QUESTION = 60;

const ExamSimulator: React.FC = () => {
  const [view, setView] = useState<'setup' | 'exam' | 'results' | 'history' | 'review'>('setup');
  const [topic, setTopic] = useState('Molecular Biology');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const timerRef = useRef<number | null>(null);

  const [history, setHistory] = useState<ExamResult[]>([]);
  const [reviewExam, setReviewExam] = useState<ExamResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('edu_exam_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (view === 'exam' && !selectedAnswer && !loading && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAnswer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [view, currentIndex, selectedAnswer, loading, isPaused]);

  const startExam = async () => {
    setLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setTimeLeft(TIME_PER_QUESTION);
    setIsPaused(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a 5-question exam for a student struggling with "${topic}" at ${difficulty} level. Focus on conceptual depth.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });
      const generated = JSON.parse(response.text || "[]");
      setQuestions(generated);
      setView('exam');
    } catch (err) {
      console.error("Exam generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string | null) => {
    if (selectedAnswer || isPaused) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    
    setSelectedAnswer(answer);
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIndex] = answer;
    setUserAnswers(updatedAnswers);

    if (answer === questions[currentIndex].correctAnswer) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setTimeLeft(TIME_PER_QUESTION);
        setIsPaused(false);
      } else {
        saveResults(updatedAnswers);
        setView('results');
      }
    }, 1500);
  };

  const togglePause = () => {
    if (selectedAnswer) return;
    setIsPaused(!isPaused);
  };

  const saveResults = (finalAnswers: (string | null)[]) => {
    const result: ExamResult = {
      id: Date.now().toString(),
      topic,
      difficulty,
      score: score + (finalAnswers[currentIndex] === questions[currentIndex].correctAnswer ? 1 : 0),
      total: questions.length,
      date: new Date().toLocaleString(),
      questions: [...questions],
      userAnswers: finalAnswers
    };

    const newHistory = [result, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('edu_exam_history', JSON.stringify(newHistory));
  };

  const deleteHistory = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('edu_exam_history', JSON.stringify(newHistory));
  };

  const openReview = (exam: ExamResult) => {
    setReviewExam(exam);
    setView('review');
    setCurrentIndex(0);
  };

  const progressPercentage = (timeLeft / TIME_PER_QUESTION) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header - Calm Minimalist */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Examination Engine</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Protocol Version 2.1 • Smart Monitoring</p>
          </div>
        </div>

        {view === 'setup' && (
          <button 
            onClick={() => setView('history')}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
          >
            <History className="w-4 h-4" /> History
          </button>
        )}
        
        {view !== 'setup' && view !== 'exam' && (
          <button 
            onClick={() => setView('setup')}
            className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg"
          >
            <ChevronLeft className="w-4 h-4" /> Reset Simulator
          </button>
        )}
      </div>

      {/* Setup View */}
      {view === 'setup' && (
        <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-10 animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Scientific Discipline</label>
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic..."
                className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-slate-900 outline-none transition-all font-bold text-slate-800"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Neural Difficulty</label>
              <div className="grid grid-cols-2 gap-3">
                {['Easy', 'Medium', 'Hard', 'Expert'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] border transition-all ${
                      difficulty === d 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50 flex flex-col items-center">
             <button 
                onClick={startExam}
                disabled={loading || !topic}
                className="w-full py-6 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-30 active:scale-[0.98]"
              >
                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <>Initiate Protocol <ArrowRight className="w-5 h-5" /></>}
             </button>
          </div>
        </div>
      )}

      {/* History View */}
      {view === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          {history.length === 0 ? (
            <div className="text-center py-24 bg-white/40 rounded-[2.5rem] border border-slate-100">
               <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No previous sessions found</p>
            </div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${h.score / h.total >= 0.6 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span className="text-lg">{h.score}</span>
                    <span className="text-[10px] opacity-40">/{h.total}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{h.topic}</h3>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{h.difficulty} • {h.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openReview(h)} className="px-5 py-2.5 bg-slate-50 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Review</button>
                  <button onClick={() => deleteHistory(h.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Exam View - REFINED WITH PRECISION TIMER */}
      {view === 'exam' && questions.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden relative">
            
            {/* Precision Visual Progress Bar */}
            <div className="h-2 bg-slate-50 w-full overflow-hidden">
               <div 
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft > 30 ? 'bg-slate-900' : timeLeft > 10 ? 'bg-amber-400' : 'bg-red-500'
                }`}
                style={{ width: `${progressPercentage}%` }} 
               />
            </div>
            
            <div className="p-12 space-y-12">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                <div className="flex items-center gap-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">SEGMENT {currentIndex + 1} OF {questions.length}</span>
                  <span className="opacity-50">{topic}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={togglePause}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
                      isPaused ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
                    <span className="tracking-widest">{isPaused ? 'RESUME' : 'PAUSE'}</span>
                  </button>

                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 ${timeLeft < 10 ? 'text-red-600' : 'text-slate-900'}`}>
                    <Clock className={`w-3.5 h-3.5 ${timeLeft < 10 ? 'animate-pulse' : ''}`} />
                    <span className="tabular-nums font-black">{timeLeft}s</span>
                  </div>
                </div>
              </div>

              {/* Blurred Content for integrity during Pause */}
              <div className={`space-y-10 transition-all duration-500 ${isPaused ? 'blur-2xl opacity-10 pointer-events-none' : 'opacity-100'}`}>
                <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                  {questions[currentIndex].question}
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {questions[currentIndex].options.map((option) => {
                    const isCorrect = option === questions[currentIndex].correctAnswer;
                    const isSelected = selectedAnswer === option;
                    
                    let variant = "bg-white border-slate-100 text-slate-600 hover:border-slate-400 hover:shadow-lg";
                    if (selectedAnswer) {
                      if (isCorrect) variant = "bg-emerald-50 border-emerald-300 text-emerald-800 scale-[1.01]";
                      else if (isSelected) variant = "bg-red-50 border-red-300 text-red-800";
                      else variant = "opacity-20 bg-slate-50 border-slate-50 grayscale";
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(option)}
                        disabled={!!selectedAnswer || isPaused}
                        className={`p-6 text-left border-2 rounded-2xl transition-all flex items-center justify-between font-bold text-lg group ${variant}`}
                      >
                        <span className="flex-1 pr-6">{option}</span>
                        {selectedAnswer && isCorrect && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                        {selectedAnswer && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer && (
                  <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-6 animate-in slide-in-from-top-2">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Neural Clarification</p>
                      <p className="text-slate-700 text-sm leading-relaxed font-bold italic">
                        {questions[currentIndex].explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pause Overlay Interface */}
              {isPaused && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-20">
                   <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl animate-pulse">
                      <Pause className="w-8 h-8 fill-current" />
                   </div>
                   <h4 className="text-2xl font-black text-slate-900 mb-2">Simulation Suspended</h4>
                   <p className="text-slate-400 font-bold max-w-xs mb-8">Content obscured to maintain integrity. Resume to continue session.</p>
                   <button 
                    onClick={togglePause}
                    className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3"
                   >
                     <Play className="w-4 h-4 fill-current" /> Resume Now
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {view === 'results' && (
        <div className="bg-white/80 backdrop-blur-xl p-16 rounded-[3.5rem] border border-slate-100 shadow-2xl text-center space-y-12 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
            <CheckCircle className="w-12 h-12 text-slate-300" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Session Concluded</h2>
            <p className="text-slate-400 font-bold text-lg mt-2 uppercase tracking-widest">Protocol Success • Accuracy Verified</p>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto">
             <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Raw Score</p>
                <p className="text-4xl font-black text-slate-900">{score}/{questions.length}</p>
             </div>
             <div className={`p-8 rounded-[2rem] border ${score / questions.length >= 0.6 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precision</p>
                <p className={`text-4xl font-black ${score / questions.length >= 0.6 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {Math.round((score/questions.length)*100)}%
                </p>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
             <button onClick={startExam} className="flex-1 px-8 py-5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all">New Simulation</button>
             <button onClick={() => setView('history')} className="flex-1 px-8 py-5 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">Records</button>
          </div>
        </div>
      )}

      {/* Review View */}
      {view === 'review' && reviewExam && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          <div className="bg-slate-900 p-12 rounded-[3rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mb-3">Protocol Retrospective</p>
              <h2 className="text-4xl font-black tracking-tighter">{reviewExam.topic}</h2>
            </div>
            <div className="relative z-10 bg-white/10 px-8 py-6 rounded-3xl text-center backdrop-blur-md border border-white/10">
              <p className="text-4xl font-black">{reviewExam.score}/{reviewExam.total}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accuracy</p>
            </div>
          </div>

          <div className="space-y-6">
            {reviewExam.questions.map((q, idx) => {
              const userAns = reviewExam.userAnswers[idx];
              const isCorrect = userAns === q.correctAnswer;
              
              return (
                <div key={idx} className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                   <div className="flex justify-between items-center mb-8">
                      <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {isCorrect ? 'Accurate Selection' : userAns === null ? 'Protocol Timeout' : 'Correction Needed'}
                      </span>
                      <span className="text-[10px] font-black text-slate-200">ID# {idx + 1}</span>
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 mb-10 leading-snug">{q.question}</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                      {q.options.map((opt) => (
                        <div key={opt} className={`p-5 border-2 rounded-2xl text-sm font-bold flex items-center justify-between ${
                            opt === q.correctAnswer ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : opt === userAns ? 'border-red-100 bg-red-50 text-red-800' : 'border-slate-50 bg-slate-50/50 text-slate-300'
                          }`}>
                          {opt}
                          {opt === q.correctAnswer && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                          {opt === userAns && opt !== q.correctAnswer && <XCircle className="w-5 h-5 text-red-400" />}
                        </div>
                      ))}
                   </div>

                   <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Retrospective Context</p>
                      <p className="text-slate-600 text-sm leading-relaxed font-bold italic">{q.explanation}</p>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSimulator;
