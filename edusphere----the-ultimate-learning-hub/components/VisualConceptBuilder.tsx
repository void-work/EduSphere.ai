
import React, { useState } from 'react';
import { Zap, Search, Image as ImageIcon, Loader2, Download, ExternalLink } from 'lucide-react';
import { generateSketch } from '../services/geminiService';

const VisualConceptBuilder: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!concept.trim()) return;
    setLoading(true);
    try {
      const url = await generateSketch(concept);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
          <Zap className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Visual Concept Builder</h1>
          <p className="text-slate-500">Generate sketches to understand difficult theories.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g. Photosynthesis, Binary Search, Black Holes..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading || !concept}
            className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            Sketch It
          </button>
        </div>
      </div>

      {imageUrl ? (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-500 overflow-hidden">
          <div className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-100 flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt={concept} 
              className="w-full h-full object-contain" 
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <a 
                href={imageUrl} 
                download={`${concept.replace(/\s+/g, '_')}_sketch.png`}
                className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform shadow-lg"
              >
                <Download className="w-6 h-6" />
              </a>
              <button 
                className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform shadow-lg"
                onClick={() => window.open(imageUrl, '_blank')}
              >
                <ExternalLink className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="mt-6 p-6 bg-slate-50 rounded-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 capitalize">{concept}</h3>
            <p className="text-slate-500 text-sm leading-relaxed italic">
              AI-generated educational visual to assist in conceptual understanding. Best used as a supplementary mental model.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
             <ImageIcon className="w-10 h-10 text-slate-300" />
           </div>
           <p className="text-slate-400 font-medium">Enter a concept to see it visually.</p>
        </div>
      )}
    </div>
  );
};

export default VisualConceptBuilder;
