
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Briefcase, 
  ClipboardCheck, 
  Mic, 
  PenTool, 
  Zap, 
  Brain, 
  Gamepad2, 
  Layers, 
  User as UserIcon, 
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ToolType, User } from './types';
import TextbookCompanion from './components/TextbookCompanion';
import SkillBridge from './components/SkillBridge';
import ExamSimulator from './components/ExamSimulator';
import VoiceTutor from './components/VoiceTutor';
import VisualConceptBuilder from './components/VisualConceptBuilder';
import KidsCoach from './components/KidsCoach';
import Notetaker from './components/Notetaker';
import Dashboard from './components/Dashboard';
import InfographicCreator from './components/InfographicCreator';
import Curator from './components/Curator';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('edu_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const surname = formData.get('surname') as string;
    const email = formData.get('email') as string;
    
    const fullName = `${firstName} ${surname}`.trim() || 'Alex Learner';
    
    const mockUser = { 
      id: Date.now().toString(), 
      name: fullName, 
      email: email || 'alex@example.com', 
      isLoggedIn: true 
    };
    
    setUser(mockUser);
    localStorage.setItem('edu_user', JSON.stringify(mockUser));
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edu_user');
    setActiveTool(ToolType.DASHBOARD);
  };

  const renderTool = () => {
    if (!user && activeTool !== ToolType.DASHBOARD) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/40 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20">
            <UserIcon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black mb-4 text-slate-900 tracking-tight">Identify Yourself</h2>
          <p className="text-slate-500 max-w-sm mb-8 font-medium leading-relaxed">Sign in with your name and surname to access advanced AI tutoring features.</p>
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-3"
          >
            Sign In Now <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      );
    }

    switch (activeTool) {
      case ToolType.TEXTBOOK: return <TextbookCompanion />;
      case ToolType.CAREER: return <SkillBridge />;
      case ToolType.EXAM: return <ExamSimulator />;
      case ToolType.TUTOR: return <VoiceTutor />;
      case ToolType.VISUAL: return <VisualConceptBuilder />;
      case ToolType.KIDS: return <KidsCoach />;
      case ToolType.NOTES: return <Notetaker />;
      case ToolType.INFOGRAPHIC: return <InfographicCreator />;
      case ToolType.CURATOR: return <Curator />;
      default: return <Dashboard onSelectTool={setActiveTool} userName={user?.name || 'Explorer'} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Sidebar - Professional Light Glass */}
      <aside className="w-full md:w-72 glass border-r border-slate-200/40 flex flex-col sticky top-0 h-auto md:h-screen z-30 transition-all">
        <div className="p-8 flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <Brain className="w-7 h-7" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">
            EduSphere
          </span>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem 
            icon={<Sparkles className="w-5 h-5" />} 
            label="Dashboard" 
            active={activeTool === ToolType.DASHBOARD} 
            onClick={() => setActiveTool(ToolType.DASHBOARD)} 
          />
          <div className="mt-8 mb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Curriculum
          </div>
          <NavItem 
            icon={<BookOpen className="w-5 h-5" />} 
            label="Textbook AI" 
            active={activeTool === ToolType.TEXTBOOK} 
            onClick={() => setActiveTool(ToolType.TEXTBOOK)} 
          />
          <NavItem 
            icon={<Sparkles className="w-5 h-5 text-indigo-400" />} 
            label="AI Curator" 
            active={activeTool === ToolType.CURATOR} 
            onClick={() => setActiveTool(ToolType.CURATOR)} 
          />
          <NavItem 
            icon={<Layers className="w-5 h-5" />} 
            label="Infographic Pro" 
            active={activeTool === ToolType.INFOGRAPHIC} 
            onClick={() => setActiveTool(ToolType.INFOGRAPHIC)} 
          />
          <NavItem 
            icon={<Briefcase className="w-5 h-5" />} 
            label="Career Bridge" 
            active={activeTool === ToolType.CAREER} 
            onClick={() => setActiveTool(ToolType.CAREER)} 
          />
          <NavItem 
            icon={<ClipboardCheck className="w-5 h-5" />} 
            label="Exam Sim" 
            active={activeTool === ToolType.EXAM} 
            onClick={() => setActiveTool(ToolType.EXAM)} 
          />
          <NavItem 
            icon={<PenTool className="w-5 h-5" />} 
            label="Smart Notes" 
            active={activeTool === ToolType.NOTES} 
            onClick={() => setActiveTool(ToolType.NOTES)} 
          />
          <div className="mt-8 mb-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            AI Experiments
          </div>
          <NavItem 
            icon={<Mic className="w-5 h-5" />} 
            label="Live Tutor" 
            active={activeTool === ToolType.TUTOR} 
            onClick={() => setActiveTool(ToolType.TUTOR)} 
          />
          <NavItem 
            icon={<Zap className="w-5 h-5" />} 
            label="Concept Sketch" 
            active={activeTool === ToolType.VISUAL} 
            onClick={() => setActiveTool(ToolType.VISUAL)} 
          />
          <NavItem 
            icon={<Gamepad2 className="w-5 h-5" />} 
            label="Kids Logic" 
            active={activeTool === ToolType.KIDS} 
            onClick={() => setActiveTool(ToolType.KIDS)} 
          />
        </nav>

        <div className="p-6">
          {user ? (
            <div className="flex items-center justify-between bg-slate-100/50 p-4 rounded-3xl border border-slate-200/50 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-black">{user.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black truncate text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Premium Access</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group"
            >
              Sign In <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12 transition-all">
        <div className="max-w-6xl mx-auto h-full">
          {renderTool()}
        </div>
      </main>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-12 animate-in zoom-in-95 duration-300 border border-white">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-100">
               <Brain className="w-9 h-9" />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-3 text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mb-10 font-bold">Your personalized AI tutor is ready when you are.</p>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">First Name</label>
                  <input 
                    name="firstName"
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Surname</label>
                  <input 
                    name="surname"
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <input 
                  name="email"
                  type="email" 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                <input 
                  name="password"
                  type="password" 
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" 
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3"
              >
                Launch Experience <Sparkles className="w-5 h-5 text-amber-400" />
              </button>
            </form>
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="w-full mt-8 py-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-black uppercase tracking-widest"
            >
              Cancel Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group ${
      active 
        ? 'bg-white text-indigo-600 shadow-xl shadow-slate-200/50 scale-105 border border-slate-100' 
        : 'text-slate-400 hover:bg-white/50 hover:text-slate-900'
    }`}
  >
    <span className={`${active ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-500 transition-colors'}`}>{icon}</span>
    <span className="text-sm font-black tracking-tight">{label}</span>
  </button>
);

export default App;
