
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Brain, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface TranscriptItem {
  role: 'user' | 'ai';
  text: string;
}

const VoiceTutor: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Manual Base64 Implementation as per requirements
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      setError(null);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Handle Transcription (Enabling the tutor to "Speak" English visually)
            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              setTranscript(prev => {
                const lastItem = prev[prev.length - 1];
                if (lastItem && lastItem.role === 'ai') {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...lastItem, text: lastItem.text + text };
                  return updated;
                }
                return [...prev, { role: 'ai', text: text }];
              });
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => setError("Connection error occurred. Please try again."),
          onclose: () => {
            setIsActive(false);
            setStatus('idle');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {}, // Enable seeing what the AI says
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Zephyr' } 
            } 
          },
          systemInstruction: 'You are an expert tutor on EduSphere. IMPORTANT: You must communicate EXCLUSIVELY in English. Answer questions accurately and explain concepts clearly using natural speech. If the user speaks a different language, respond in English explaining that you are an English-language tutor.'
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setError("Failed to initialize session. Check mic permissions.");
      setStatus('idle');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-start space-y-8 py-8 h-[calc(100vh-120px)] overflow-hidden">
      <div className="text-center space-y-4 shrink-0">
        <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 mx-auto mb-4 shadow-sm">
          <Brain className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">English Voice Tutor</h1>
        <p className="text-slate-500 max-w-md font-bold text-sm">Real-time voice-to-voice mentoring in English.</p>
      </div>

      <div className="w-full flex-1 overflow-hidden flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm relative">
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {transcript.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
              <Volume2 className="w-12 h-12" />
              <p className="font-black uppercase tracking-widest text-[10px]">Tutor Standing By</p>
            </div>
          ) : (
            transcript.map((item, i) => (
              <div key={i} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[80%] p-5 rounded-3xl font-bold text-sm leading-relaxed ${
                  item.role === 'user' 
                    ? 'bg-black text-white rounded-br-none' 
                    : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-none'
                }`}>
                  {item.text}
                </div>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>

        {isActive && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm animate-pulse">
               <Sparkles className="w-3 h-3" /> Live English Stream
            </div>
          </div>
        )}

        <div className="p-8 border-t border-slate-50 bg-slate-50/30">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              {isActive && (
                <div className="absolute inset-0 -m-6 rounded-full bg-orange-500/10 animate-ping" />
              )}
              <button
                onClick={isActive ? stopSession : startSession}
                disabled={status === 'connecting'}
                className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center gap-2 transition-all shadow-2xl ${
                  isActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                } ${status === 'connecting' ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {status === 'connecting' ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : isActive ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {status === 'connecting' ? 'Setup' : isActive ? 'End' : 'Talk'}
                </span>
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shrink-0">
        AI Voice Engine: {isActive ? 'Streaming Active' : 'Disconnected'}
      </p>
    </div>
  );
};

export default VoiceTutor;
