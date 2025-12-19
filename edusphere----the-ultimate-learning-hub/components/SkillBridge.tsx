
import React, { useState } from 'react';
import { Briefcase, Search, Plus, X, ArrowRight, Book, CheckCircle } from 'lucide-react';
import { mapSkillsToCareer } from '../services/geminiService';
import { CareerPlan } from '../types';

const SkillBridge: React.FC = () => {
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Problem Solving']);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<CareerPlan[]>([]);

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAnalyze = async () => {
    if (skills.length === 0) return;
    setLoading(true);
    try {
      const result = await mapSkillsToCareer(skills);
      setPlans(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
          <Briefcase className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Skill-to-Career Bridge</h1>
          <p className="text-slate-500">Discover your path based on what you know.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold mb-4">My Current Skillset</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {skills.map(s => (
            <span key={s} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold flex items-center gap-2 border border-emerald-100 group">
              {s}
              <button onClick={() => removeSkill(s)} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
        
        <form onSubmit={addSkill} className="flex gap-2">
          <input 
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g., Python, Marketing, Design)"
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button type="submit" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </form>

        <button 
          onClick={handleAnalyze}
          disabled={loading || skills.length === 0}
          className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          {loading ? 'Analyzing career paths...' : 'Analyze My Future'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {plans.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {plans.map((plan, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.role}</h3>
                  <p className="text-slate-500 leading-relaxed max-w-2xl">{plan.description}</p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
                  92% Skill Match
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                    <CheckCircle className="w-4 h-4" /> Recommended Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.skillsNeeded.map(s => (
                      <span key={s} className="px-3 py-1 bg-slate-100 rounded-md text-sm text-slate-600">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                    <Book className="w-4 h-4" /> Learning Plan
                  </h4>
                  <ul className="space-y-3">
                    {plan.learningSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">{idx + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillBridge;
