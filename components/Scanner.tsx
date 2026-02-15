import React, { useState, useRef, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertTriangle, Loader2, Microscope, Leaf, Recycle, Clock, FlaskConical, Droplet, Package } from 'lucide-react';
import { analyzeImageWithGemini } from '../services/geminiService.ts';
import { PLASTICS } from '../constants.ts';
import { Language, PlasticType } from '../types.ts';
import Latex from './Latex.tsx';

interface ScannerProps {
  lang: Language;
  onScanComplete: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ lang, onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PlasticType | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(lang === 'en'
          ? "Camera not supported in this browser. Please use Chrome, Firefox, or Edge."
          : "الكاميرا غير مدعومة في هذا المتصفح. استخدم Chrome أو Firefox أو Edge");
        return;
      }

      // Request camera permission with constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays
        videoRef.current.play().catch(e => {
          console.error('Video play error:', e);
        });
      }

      setError(null);
    } catch (err: any) {
      console.error('Camera error:', err);

      // Detailed error messages
      let errorMessage = '';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = lang === 'en'
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : "تم رفض إذن الكاميرا. يرجى السماح بالوصول للكاميرا في إعدادات المتصفح.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = lang === 'en'
          ? "No camera found. Please connect a camera and try again."
          : "لم يتم العثور على كاميرا. يرجى توصيل كاميرا والمحاولة مرة أخرى.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = lang === 'en'
          ? "Camera is already in use by another application. Please close other apps and try again."
          : "الكاميرا قيد الاستخدام من تطبيق آخر. أغلق التطبيقات الأخرى وحاول مرة أخرى.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = lang === 'en'
          ? "Camera settings not supported. Trying with default settings..."
          : "إعدادات الكاميرا غير مدعومة. جارٍ المحاولة بإعدادات افتراضية...";

        // Retry with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(basicStream);
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            videoRef.current.play();
          }
          setError(null);
          return;
        } catch (retryErr) {
          errorMessage = lang === 'en'
            ? "Camera access failed. Please check permissions."
            : "فشل الوصول للكاميرا. تحقق من الأذونات.";
        }
      } else if (err.name === 'SecurityError') {
        errorMessage = lang === 'en'
          ? "Camera access blocked due to security settings. Please use HTTPS or localhost."
          : "تم حظر الوصول للكاميرا بسبب إعدادات الأمان. استخدم HTTPS أو localhost.";
      } else {
        errorMessage = lang === 'en'
          ? `Camera error: ${err.message || 'Unknown error'}. Please refresh and try again.`
          : `خطأ في الكاميرا: ${err.message || 'خطأ غير معروف'}. يرجى التحديث والمحاولة مرة أخرى.`;
      }

      setError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        const imageSrc = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(imageSrc);
        stopCamera();
        handleAnalysis(imageSrc);
      }
    }
  }, [videoRef]);

  const handleAnalysis = async (imageSrc: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setAiExplanation('');

    try {
      const jsonResponse = await analyzeImageWithGemini(imageSrc, lang);

      let parsed;
      try {
        const match = jsonResponse.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(match ? match[0] : jsonResponse);
      } catch (e) {
        parsed = { id: 'UNKNOWN', code: 0 };
      }

      setAiExplanation(parsed.detailed_explanation || '');

      if (parsed.id && PLASTICS[parsed.id]) {
        setResult(PLASTICS[parsed.id]);
        onScanComplete();
      } else {
        setResult({
          id: parsed.id || 'OTHER',
          code: parsed.code || 7,
          name: parsed.analysis || (lang === 'en' ? 'Unidentified Material' : 'مادة غير معروفة'),
          name_ar: parsed.analysis || 'مادة تم تحديدها',
          commonName: '',
          structure: '',
          formula: '',
          polymerization: '',
          properties: [],
          safety: lang === 'en' ? 'Safe under normal use.' : 'آمنة في الاستخدام الطبيعي.',
          safety_ar: 'آمنة في الاستخدام الطبيعي.',
          sustainability: '',
          description_ar: '',
          recyclabilityScore: 50,
          degradationYears: 500
        });
        onScanComplete();
      }
    } catch (err) {
      setError(lang === 'en' ? "Analysis failed. Please try again." : "فشل التحليل. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setAiExplanation('');
    startCamera();
  };

  const getRecyclabilityColor = (score?: number) => {
    if (!score) return 'text-slate-500';
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecyclabilityBg = (score?: number) => {
    if (!score) return 'bg-slate-500/10 border-slate-500/20';
    if (score >= 70) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 animate-fade-in">
      <div className="relative w-full aspect-[3/4] bg-slate-900 rounded-[2.5rem] overflow-hidden border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] group">


        {error && (
          <div className="absolute inset-0 bg-slate-900/90 z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in backdrop-blur-sm">
            <div className="p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/20 animate-shake">
              <AlertTriangle size={36} className="text-red-400" />
            </div>
            <p className="text-red-200 mb-6 font-medium max-w-[260px] leading-relaxed">{error}</p>
            <button
              onClick={startCamera}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-2xl flex items-center gap-2 transition shadow-lg shadow-red-500/20 active:scale-95 font-bold"
            >
              <RefreshCw size={18} />
              <span>{lang === 'en' ? 'Try Again' : 'حاول مرة أخرى'}</span>
            </button>
          </div>
        )}

        {!capturedImage && (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        )}

        {capturedImage && (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {isAnalyzing && (
          <div className="absolute inset-0 bg-emerald-500/10 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="w-full h-1 bg-emerald-400 shadow-[0_0_20px_#34d399] animate-scan-line absolute top-0"></div>
            <div className="bg-slate-900/90 px-8 py-4 rounded-3xl border border-emerald-500/30 flex flex-col items-center gap-4 shadow-2xl">
              <Loader2 className="animate-spin text-emerald-400" size={40} />
              <span className="text-emerald-400 font-black text-sm uppercase tracking-widest text-center">
                {lang === 'en' ? 'Laboratory Analysis...' : 'جاري التحليل الكيميائي...'}
              </span>
            </div>
          </div>
        )}

        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-6 z-10 pointer-events-none [&>button]:pointer-events-auto">
          {!error && (
            capturedImage ? (
              <button onClick={reset} className="bg-slate-800/90 backdrop-blur-md hover:bg-slate-700 text-white px-8 py-4 rounded-3xl flex items-center gap-3 border border-white/5 transition-all shadow-xl font-bold hover:scale-105 active:scale-95">
                <RefreshCw size={20} />
                <span>{lang === 'en' ? 'New Scan' : 'تحليل جديد'}</span>
              </button>
            ) : !stream ? (
              <button onClick={startCamera} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-6 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 animate-pulse-slow">
                <Camera size={36} />
              </button>
            ) : (
              <button onClick={capture} className="bg-white text-emerald-600 p-8 rounded-full shadow-2xl border-4 border-emerald-500/30 transition-all hover:scale-105 active:scale-90 group relative cursor-pointer">
                <div className="w-6 h-6 bg-emerald-600 rounded-full group-hover:scale-125 transition duration-300"></div>
                <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-75"></div>
              </button>
            )
          )}
        </div>
      </div>

      {result && (
        <div className="mt-8 w-full bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/20 rounded-[2.5rem] p-8 shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"></div>

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black text-white leading-tight">
                {lang === 'en' ? result.name : result.name_ar}
              </h2>
              <div className="mt-3 inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  {lang === 'en' ? 'Polymer ID' : 'معرف البوليمر'}
                </span>
              </div>
            </div>
            <div className="w-20 h-20 bg-slate-950 border-2 border-emerald-500/30 rounded-3xl flex flex-col items-center justify-center shadow-inner group hover:border-emerald-500 transition-colors">
              <span className="text-lg mb-0.5">♻️</span>
              <span className="text-3xl font-black text-white leading-none">{result.code || '7'}</span>
            </div>
          </div>

          {/* Chemical Formula */}
          {result.formula && (
            <div className="mb-6 p-6 bg-slate-950/40 rounded-3xl border border-blue-500/10">
              <div className="flex items-center gap-3 mb-3 text-blue-400">
                <FlaskConical size={20} className="shrink-0" />
                <span className="font-black text-xs uppercase tracking-widest">{lang === 'en' ? 'Chemical Formula' : 'الصيغة الكيميائية'}</span>
              </div>
              <div className="text-center text-2xl text-white font-mono">
                <Latex>{result.formula}</Latex>
              </div>
              {result.chemicalBonds && (
                <p className="text-xs text-slate-400 text-center mt-3 font-mono">{result.chemicalBonds}</p>
              )}
            </div>
          )}

          {/* Recyclability Score */}
          {result.recyclabilityScore !== undefined && (
            <div className={`mb-6 p-6 rounded-3xl border ${getRecyclabilityBg(result.recyclabilityScore)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Recycle size={22} className={getRecyclabilityColor(result.recyclabilityScore)} />
                  <span className="font-black text-xs uppercase tracking-widest text-slate-300">
                    {lang === 'en' ? 'Recyclability Index' : 'مؤشر القابلية للتدوير'}
                  </span>
                </div>
                <span className={`text-3xl font-black ${getRecyclabilityColor(result.recyclabilityScore)}`}>
                  {result.recyclabilityScore}%
                </span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className={`h-full ${result.recyclabilityScore >= 70 ? 'bg-emerald-500' : result.recyclabilityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'} transition-all duration-1000 shadow-lg`}
                  style={{ width: `${result.recyclabilityScore}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Environmental Degradation */}
          {result.degradationYears && (
            <div className="mb-6 p-6 bg-purple-500/5 rounded-3xl border border-purple-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-purple-400 shrink-0" />
                  <div>
                    <span className="block font-black text-xs uppercase tracking-widest text-purple-400">
                      {lang === 'en' ? 'Environmental Degradation' : 'التحلل البيئي'}
                    </span>
                    <span className="block text-sm text-slate-400 mt-1">
                      {lang === 'en' ? 'Natural decomposition time' : 'وقت التحلل الطبيعي'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-purple-400">{result.degradationYears}</span>
                  <span className="text-sm text-slate-400 block mt-1">{lang === 'en' ? 'years' : 'سنة'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Common Uses */}
          {result.commonUses && result.commonUses.length > 0 && (
            <div className="mb-6 p-6 bg-slate-950/40 rounded-3xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Package size={20} className="text-cyan-400 shrink-0" />
                <span className="font-black text-xs uppercase tracking-widest text-cyan-400">
                  {lang === 'en' ? 'Common Applications' : 'الاستخدامات الشائعة'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(lang === 'en' ? result.commonUses : result.commonUses_ar || result.commonUses).map((use, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-300 font-medium">
                    {use}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          {aiExplanation && (
            <div className="mb-6 bg-slate-950/40 p-6 rounded-3xl border border-emerald-500/10">
              <div className="flex items-center gap-3 mb-4 text-emerald-400">
                <Microscope size={22} className="shrink-0" />
                <span className="font-black text-xs uppercase tracking-widest">{lang === 'en' ? 'AI Laboratory Report' : 'تقرير المختبر الذكي'}</span>
              </div>
              <p className="text-[14px] text-slate-300 leading-relaxed font-arabic">
                {aiExplanation}
              </p>
            </div>
          )}

          {/* Safety Info */}
          <div className="p-6 rounded-3xl border bg-emerald-500/5 border-emerald-500/10">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={20} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                {lang === 'en' ? 'Safety Rating' : 'تقييم السلامة'}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-bold">
              {lang === 'en' ? result.safety : result.safety_ar}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-400 text-sm font-bold shadow-xl animate-shake">
          <AlertTriangle size={24} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

export default Scanner;