import React, { useState, useRef, useEffect } from 'react';
import {
  LearningMission,
  StudentProfile,
  VirtualPet,
  TutorMessage,
  AcademicRecord,
  SubjectType,
} from '../types';
import {
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Send,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  XCircle,
  Gem,
  Award,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Heart,
  Zap,
  Coffee,
  Play,
  RotateCcw,
  Eraser,
  Check,
  Star,
  Compass,
  Smile,
  ShieldAlert,
  Search,
  Filter,
  Layers,
  Gamepad2,
  BookOpen,
  Pencil,
  Hash,
  Lock,
  Unlock,
  Square,
  Clock,
  Shuffle,
} from 'lucide-react';
import { askSocraticTutor } from '../services/tutorAi';
import {
  speakText,
  stopSpeaking,
  SpeechRecognizer,
  playSoundEffect,
} from '../services/speechService';
import { ArcadeMiniGame } from './ArcadeMiniGame';
import { AdvancedArcadeZone } from './advanced_games/AdvancedArcadeZone';
import { VirtualPetCareZone } from './VirtualPetCareZone';
import { WORLDS_100_INFO, shuffleAlternatedGames } from '../data/combinedGamesData';

interface CoreOperationsViewProps {
  missions: LearningMission[];
  onUpdateMissions: (missions: LearningMission[]) => void;
  student: StudentProfile;
  onUpdateStudent: (student: StudentProfile | ((prev: StudentProfile) => StudentProfile)) => void;
  pet: VirtualPet;
  onUpdatePet: (pet: VirtualPet | ((prev: VirtualPet) => VirtualPet)) => void;
  activeMissionId?: string;
  onSelectMission: (id: string) => void;
  onAddToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  onAddRecord: (record: AcademicRecord) => void;
}

export const CoreOperationsView: React.FC<CoreOperationsViewProps> = ({
  missions,
  onUpdateMissions,
  student,
  onUpdateStudent,
  pet,
  onUpdatePet,
  activeMissionId,
  onSelectMission,
  onAddToast,
  onAddRecord,
}) => {
  // Current active mission
  const currentMission =
    missions.find((m) => m.id === activeMissionId) || missions[0] || missions[0];

  const currentMissionIndex = missions.findIndex((m) => m.id === currentMission?.id);

  // Active Sub-view in Core Operations: 'adventure' | 'mission' | 'arcade_vip' | 'pet_zone'
  const [activeSubTab, setActiveSubTab] = useState<'mission' | 'adventure' | 'arcade_vip' | 'pet_zone'>('mission');

  // Interactive Mission States
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [celebrationGems, setCelebrationGems] = useState<number | null>(null);

  // 50 Games Filter and World Explorer states
  const [selectedWorld, setSelectedWorld] = useState<number>(0); // 0 = all worlds
  const [categoryFilter, setCategoryFilter] = useState<'all' | SubjectType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Canvas for Tracing Mission
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Tutor Chat & Socratic Dialogue
  const [chatMessages, setChatMessages] = useState<TutorMessage[]>([
    {
      id: 'm1',
      sender: 'tutor',
      text: `¡Hola ${student.name}! Soy Lumi, tu tutor socrático. Hay 50 juegos y retos en 5 mundos. ¿Qué desafío exploramos hoy?`,
      timestamp: 'Ahora',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isTutorThinking, setIsTutorThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognizer, setSpeechRecognizer] = useState<SpeechRecognizer | null>(null);

  // Initialize Speech Recognizer
  useEffect(() => {
    const recognizer = new SpeechRecognizer(
      (transcript) => {
        setInputQuestion(transcript);
        handleSendQuestion(transcript);
      },
      (error) => {
        onAddToast('Micrófono', `Error de audio: ${error}`, 'info');
      },
      (listening) => {
        setIsListening(listening);
      }
    );
    setSpeechRecognizer(recognizer);

    return () => {
      stopSpeaking();
    };
  }, []);

  // 3-Minute Reading-First Autonomous Timer & Play/Stop Voice State
  const [readingSecondsLeft, setReadingSecondsLeft] = useState(180); // 3 minutes
  const [isVoiceUnlocked, setIsVoiceUnlocked] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState<string | null>(null);

  // When changing mission: stop any ongoing voice, set 3-min reading timer, keep voice locked
  useEffect(() => {
    setSelectedOption(null);
    setFeedbackState('idle');
    setCelebrationGems(null);
    setHasDrawn(false);
    clearCanvas();

    // Stop speaking immediately when choosing or changing a game
    stopSpeaking();
    setIsPlayingVoice(false);
    setCurrentlySpeakingText(null);

    // Reset 3-minute reading timer (child must read first)
    setReadingSecondsLeft(180);
    setIsVoiceUnlocked(false);

    // Tutor introduces the mission silently in text chat so the child reads first!
    if (currentMission) {
      const introText = `¡Bienvenido al Juego #${currentMission.level}: "${currentMission.title}"! ${currentMission.question}`;
      setChatMessages((prev) => [
        ...prev,
        {
          id: `tutor-intro-${Date.now()}`,
          sender: 'tutor',
          text: introText,
          timestamp: 'Ahora',
        },
      ]);
    }
  }, [currentMission?.id]);

  // 3-Minute Countdown Timer for Autonomous Reading
  useEffect(() => {
    if (isVoiceUnlocked) return;

    const interval = setInterval(() => {
      setReadingSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsVoiceUnlocked(true);
          playSoundEffect('unlock');
          onAddToast(
            '¡Tiempo de lectura cumplido!',
            'Has completado tus 3 minutos de lectura. La voz de Lumi ya está lista para reproducirse.',
            'success'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVoiceUnlocked, currentMission?.id]);

  // Quick unlock for parents or testing during evaluations
  const handleInstantUnlockVoice = () => {
    setIsVoiceUnlocked(true);
    setReadingSecondsLeft(0);
    playSoundEffect('unlock');
    onAddToast(
      'Voz Desbloqueada',
      'Modo de audio asistido habilitado para escuchar a Lumi.',
      'info'
    );
  };

  // Play / Stop Toggle for any voice playback
  const handleToggleVoicePlay = (textToSpeak: string) => {
    if (!isVoiceUnlocked) {
      onAddToast(
        'Modo Lectura Autónoma',
        `¡Léelo tú primero! Tómate tu tiempo para leer el reto. La voz estará disponible en ${formatTime(
          readingSecondsLeft
        )}.`,
        'info'
      );
      return;
    }

    if (isPlayingVoice) {
      // User pressed Stop to pause / stop speaking
      stopSpeaking();
      setIsPlayingVoice(false);
      setCurrentlySpeakingText(null);
      onAddToast('Voz Detenida', 'Has detenido la narración de voz', 'info');
    } else {
      // User pressed Play
      setCurrentlySpeakingText(textToSpeak);
      setIsPlayingVoice(true);
      speakText(
        textToSpeak,
        () => setIsPlayingVoice(true),
        () => {
          setIsPlayingVoice(false);
          setCurrentlySpeakingText(null);
        }
      );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#A855F7';
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Socratic Help Request
  const handleAskSocraticMode = async (
    mode: 'hint' | 'why_wrong' | 'explain_visual' | 'cheer',
    wrongVal?: string | number
  ) => {
    setIsTutorThinking(true);
    const tutorResponse = await askSocraticTutor({
      mission: currentMission,
      studentName: student.name,
      studentAge: student.age,
      persona: student.tutorPersona,
      mode,
      wrongAnswerGiven: wrongVal,
    });

    setChatMessages((prev) => [
      ...prev,
      {
        id: `tutor-soc-${Date.now()}`,
        sender: 'tutor',
        text: tutorResponse,
        timestamp: 'Ahora',
      },
    ]);

    if (student.soundEnabled) {
      speakText(tutorResponse);
    }
    setIsTutorThinking(false);
  };

  // Submit Answer Check
  const handleCheckAnswer = (answerVal: string | number) => {
    // Stop any ongoing voice so it doesn't overlap with feedback
    stopSpeaking();
    setIsPlayingVoice(false);
    setCurrentlySpeakingText(null);

    setSelectedOption(answerVal);
    const isCorrect =
      currentMission.visualData?.correctAnswer !== undefined
        ? String(answerVal).trim().toLowerCase() ===
          String(currentMission.visualData.correctAnswer).trim().toLowerCase()
        : true;

    if (isCorrect) {
      handleCompleteCurrentGame(currentMission.gemReward);
    } else {
      setFeedbackState('wrong');
      playSoundEffect('wrong');

      handleAskSocraticMode('why_wrong', answerVal);
      onAddToast(
        '¡Casi lo logras!',
        'Lumi tiene una pista socrática para ayudarte a descubrir el camino',
        'info'
      );
    }
  };

  // Shuffle & Alternate randomly the 50 math and 50 grammar games
  const handleShuffleRandomAlternation = () => {
    stopSpeaking();
    setIsPlayingVoice(false);
    setCurrentlySpeakingText(null);
    const shuffled = shuffleAlternatedGames(missions);
    onUpdateMissions(shuffled);
    onSelectMission(shuffled[0].id);
    onAddToast(
      '¡Juegos Alternados Aleatoriamente!',
      'Se han mezclado los 50 juegos de matemáticas y los 50 de gramática alternados al azar (1 Matemática 🎲 1 Gramática...).',
      'success'
    );
    playSoundEffect('unlock');
  };

  // Complete any game (learning or arcade)
  const handleCompleteCurrentGame = (gemsWon: number) => {
    setFeedbackState('correct');
    setCelebrationGems(gemsWon);
    playSoundEffect('correct');

    onUpdateStudent((prev) => ({
      ...prev,
      gems: prev.gems + gemsWon,
      screenTimeUsedMinutes: Math.min(
        prev.dailyScreenTimeLimitMinutes,
        prev.screenTimeUsedMinutes + 1
      ),
    }));

    const updated = missions.map((m) =>
      m.id === currentMission.id ? { ...m, completed: true, stars: 3 } : m
    );
    onUpdateMissions(updated);

    onAddRecord({
      id: `rec-${Date.now()}`,
      studentName: student.name,
      subject:
        currentMission.subject === 'math'
          ? 'Matemáticas'
          : currentMission.subject === 'reading'
          ? 'Lectura'
          : currentMission.subject === 'tracing'
          ? 'Escritura'
          : 'Arcade',
      activityName: currentMission.title,
      score: 100,
      status: 'completado',
      gemsEarned: gemsWon,
      date: new Date().toISOString().split('T')[0],
      tutorFeedback: `¡Juego #${currentMission.level} superado con éxito! Razonamiento y persistencia impecables.`,
    });

    onAddToast(
      '¡Juego Superado!',
      `+${gemsWon} gemas añadidas a tu alcancía virtual`,
      'success'
    );

    const praise = `¡Extraordinario, ${student.name}! ¡Resolviste "${currentMission.title}" y ganaste ${gemsWon} gemas brillantes!`;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `praise-${Date.now()}`,
        sender: 'tutor',
        text: praise,
        timestamp: 'Ahora',
      },
    ]);
    if (student.soundEnabled) {
      speakText(praise);
    }
  };

  // Submit Tracing Verification
  const handleValidateTracing = () => {
    if (!hasDrawn) {
      onAddToast('Lienzo vacío', 'Usa tu dedo o el ratón para trazar en la pizarra mágica', 'info');
      return;
    }
    handleCheckAnswer(currentMission.visualData?.traceChar || 'S');
  };

  // Chat message send
  const handleSendQuestion = async (customText?: string) => {
    const textToSend = customText || inputQuestion;
    if (!textToSend.trim()) return;

    const userMsg: TutorMessage = {
      id: `usr-${Date.now()}`,
      sender: 'student',
      text: textToSend,
      timestamp: 'Ahora',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsTutorThinking(true);

    const tutorResponse = await askSocraticTutor({
      studentQuestion: textToSend,
      mission: currentMission,
      studentName: student.name,
      studentAge: student.age,
      persona: student.tutorPersona,
      mode: 'free_chat',
    });

    setChatMessages((prev) => [
      ...prev,
      {
        id: `tutor-reply-${Date.now()}`,
        sender: 'tutor',
        text: tutorResponse,
        timestamp: 'Ahora',
      },
    ]);

    if (student.soundEnabled) {
      speakText(tutorResponse);
    }
    setIsTutorThinking(false);
  };

  // Toggle Microphone for STT
  const handleToggleMic = () => {
    if (!speechRecognizer) {
      onAddToast('Audio', 'Tu navegador no soporta entrada de voz directa', 'info');
      return;
    }
    if (isListening) {
      speechRecognizer.stop();
    } else {
      speechRecognizer.start();
      onAddToast('¡Te escucho amigo!', 'Háblale a Lumi con tu voz, ¡te escucha con todo el cariño de un gran amigo!', 'info');
    }
  };

  // Virtual Pet Interactions
  const handlePetAction = (
    action: 'feed' | 'play' | 'sleep' | 'bath',
    cost: number,
    label: string
  ) => {
    if (student.gems < cost) {
      onAddToast(
        'Gemas insuficientes',
        `Necesitas ${cost} gemas para ${label}. ¡Supera más juegos para ganar gemas!`,
        'error'
      );
      playSoundEffect('wrong');
      return;
    }

    onUpdateStudent((prev) => ({
      ...prev,
      gems: prev.gems - cost,
      screenTimeUsedMinutes: Math.min(
        prev.dailyScreenTimeLimitMinutes,
        prev.screenTimeUsedMinutes + 1
      ),
    }));

    onUpdatePet((prev) => {
      let hunger = prev.hunger;
      let happiness = prev.happiness;
      let energy = prev.energy;
      let level = prev.level;

      if (action === 'feed') {
        hunger = Math.min(100, hunger + 30);
        happiness = Math.min(100, happiness + 15);
      } else if (action === 'play') {
        happiness = Math.min(100, happiness + 25);
        energy = Math.max(10, energy - 20);
      } else if (action === 'sleep') {
        energy = Math.min(100, energy + 40);
        hunger = Math.max(10, hunger - 10);
      } else if (action === 'bath') {
        happiness = Math.min(100, happiness + 20);
        level += 1;
      }

      return {
        ...prev,
        hunger,
        happiness,
        energy,
        level,
        lastFed: action === 'feed' ? 'Justo ahora' : prev.lastFed,
      };
    });

    playSoundEffect('feed');
    onAddToast('¡Mascota Feliz!', `${pet.name} disfrutó: ${label} (-${cost} gemas)`, 'success');
  };

  // Filter 50 Games
  const filtered50Games = missions.filter((m) => {
    const matchesWorld = selectedWorld === 0 || m.worldNumber === selectedWorld;
    const matchesCategory = categoryFilter === 'all' || m.subject === categoryFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? m.completed
        : !m.completed;
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(m.level).includes(searchTerm);

    return matchesWorld && matchesCategory && matchesStatus && matchesSearch;
  });

  // Navigate next / previous
  const handleNavPrevMission = () => {
    if (currentMissionIndex > 0) {
      onSelectMission(missions[currentMissionIndex - 1].id);
    }
  };

  const handleNavNextMission = () => {
    if (currentMissionIndex < missions.length - 1) {
      onSelectMission(missions[currentMissionIndex + 1].id);
    }
  };

  // Helper for rendering emoji items
  const getItemEmoji = (type?: string) => {
    switch (type) {
      case 'apple':
        return '🍎';
      case 'cookie':
        return '🍪';
      case 'frog':
        return '🐸';
      case 'balloon':
        return '🎈';
      case 'pizza':
        return '🍕';
      case 'gem':
        return '💎';
      case 'dino':
        return '🦖';
      case 'rocket':
        return '🚀';
      case 'star':
      default:
        return '⭐';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar for Core Operations */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('mission')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'mission'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Juego Activo (#{currentMission?.level || 1})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('adventure')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'adventure'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Catálogo de los 100 Juegos</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-400/20 text-violet-300 font-bold">
              {missions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('arcade_vip')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'arcade_vip'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/30 font-black'
                : 'text-amber-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Zona de Ocio VIP (Guerra de las Galaxias & Recreo)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">
              🚀 Ocio
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('pet_zone')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'pet_zone'
                ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 text-white shadow-md shadow-fuchsia-600/30 font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Mascota & Tienda VIP ({pet.name})</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
              🏪 Tienda
            </span>
          </button>
        </div>

        {/* Screen Time Allowance Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Tiempo Saludable:</span>
          <span className="font-bold text-amber-300">
            {student.dailyScreenTimeLimitMinutes - student.screenTimeUsedMinutes} min restantes
          </span>
        </div>
      </div>

      {/* VIEW A: JUEGO ACTIVO + TUTOR SOCRÁTICO */}
      {activeSubTab === 'mission' && currentMission && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Game Stage (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* If it's an arcade game, render the full interactive Arcade MiniGame */}
            {currentMission.subject === 'arcade' ? (
              <ArcadeMiniGame
                mission={currentMission}
                onGameComplete={handleCompleteCurrentGame}
                soundEnabled={student.soundEnabled}
              />
            ) : (
              /* Educational Learning Game */
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                {/* Header of Mission with Next/Prev Navigator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold text-violet-400 tracking-wider">
                        Juego #{currentMission.level} de {missions.length} · {currentMission.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          currentMission.completed
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : 'bg-violet-950/80 text-violet-300 border border-violet-800'
                        }`}
                      >
                        {currentMission.completed ? 'Superado ⭐⭐⭐' : 'En Juego'}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {currentMission.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleNavPrevMission}
                        disabled={currentMissionIndex <= 0}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 border border-slate-700"
                        title="Juego anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNavNextMission}
                        disabled={currentMissionIndex >= missions.length - 1}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 border border-slate-700"
                        title="Siguiente juego"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right pl-2 border-l border-slate-800">
                      <div className="flex items-center gap-1 text-violet-400 font-extrabold text-base">
                        <Gem className="w-5 h-5 fill-violet-400" />
                        <span>+{currentMission.gemReward}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Recompensa</span>
                    </div>
                  </div>
                </div>

                {/* Autonomous Reading Mode Banner (3-min countdown) */}
                <div className="mt-4 p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg ${
                        isVoiceUnlocked
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-indigo-950 text-indigo-400 border border-indigo-800/50'
                      }`}
                    >
                      {isVoiceUnlocked ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {isVoiceUnlocked
                            ? '¡Lectura Autónoma Superada!'
                            : 'Modo Lectura Autónoma: ¡Léelo tú primero!'}
                        </span>
                        {!isVoiceUnlocked && (
                          <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                            {formatTime(readingSecondsLeft)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isVoiceUnlocked
                          ? 'Excelente. Ya puedes usar el botón de Play para escuchar o detener la voz de Lumi.'
                          : 'El niño lee por su cuenta. Tras 3 minutos, se activa la voz para escuchar el reto.'}
                      </p>
                    </div>
                  </div>

                  {!isVoiceUnlocked && (
                    <button
                      onClick={handleInstantUnlockVoice}
                      className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 underline self-start sm:self-center"
                      title="Desbloquear la voz sin esperar los 3 minutos (Modo Padres/Demo)"
                    >
                      Saltar espera (Modo Padres)
                    </button>
                  )}
                </div>

                {/* Mission Question Banner with Play/Stop Voice Button */}
                <div className="mt-4 p-4 rounded-xl bg-violet-950/40 border border-violet-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-violet-600/30 text-violet-300 shrink-0 mt-0.5">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-base sm:text-lg font-medium leading-relaxed">
                        {currentMission.question}
                      </p>
                    </div>
                  </div>

                  {student.soundEnabled && (
                    <div className="shrink-0 self-end sm:self-center">
                      {isVoiceUnlocked ? (
                        <button
                          onClick={() => handleToggleVoicePlay(currentMission.question)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                            isPlayingVoice
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400 animate-pulse'
                              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30 hover:scale-105'
                          }`}
                          title={
                            isPlayingVoice
                              ? 'Detener la voz que está sonando'
                              : 'Reproducir la voz de Lumi'
                          }
                        >
                          {isPlayingVoice ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-white" />
                              <span>Detener Voz</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Poner Play Voz</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleVoicePlay(currentMission.question)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold hover:border-amber-500/50"
                          title={`Voz bloqueada: ¡Léelo tú primero! Se activará en ${formatTime(
                            readingSecondsLeft
                          )}`}
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-mono text-amber-300">
                            {formatTime(readingSecondsLeft)}
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* DYNAMIC CONTENT BY SUBJECT */}
                <div className="mt-6">
                  {/* 1. MATH: SUMAS O RESTAS VISUALES */}
                  {currentMission.subject === 'math' &&
                    (currentMission.visualData?.operator === '+' ||
                      currentMission.visualData?.operator === '-') && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 bg-slate-950/60 p-6 rounded-xl border border-slate-800 text-center">
                          {/* Group 1 */}
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
                            <span className="text-xs text-slate-400 font-semibold block mb-2">
                              Grupo 1 ({currentMission.visualData.count1})
                            </span>
                            <div className="flex flex-wrap items-center justify-center gap-2 text-3xl">
                              {Array.from({ length: currentMission.visualData.count1 || 0 }).map(
                                (_, i) => (
                                  <span
                                    key={i}
                                    className="transform hover:scale-125 transition-transform duration-200 cursor-pointer"
                                    onClick={() => playSoundEffect('gem')}
                                  >
                                    {getItemEmoji(currentMission.visualData?.itemType)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          {/* Operator */}
                          <div className="text-3xl font-extrabold text-violet-400">
                            {currentMission.visualData.operator}
                          </div>

                          {/* Group 2 */}
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
                            <span className="text-xs text-slate-400 font-semibold block mb-2">
                              Grupo 2 ({currentMission.visualData.count2})
                            </span>
                            <div className="flex flex-wrap items-center justify-center gap-2 text-3xl">
                              {Array.from({ length: currentMission.visualData.count2 || 0 }).map(
                                (_, i) => (
                                  <span
                                    key={i}
                                    className="transform hover:scale-125 transition-transform duration-200 cursor-pointer"
                                    onClick={() => playSoundEffect('gem')}
                                  >
                                    {getItemEmoji(currentMission.visualData?.itemType)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Options */}
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                            Toca tu respuesta:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {currentMission.visualData.options?.map((opt) => {
                              const isChosen = selectedOption === opt;
                              const isCorrectOpt =
                                opt === currentMission.visualData?.correctAnswer;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleCheckAnswer(opt)}
                                  className={`p-4 rounded-xl font-black text-2xl transition-all shadow-md transform hover:-translate-y-1 ${
                                    isChosen && feedbackState === 'correct' && isCorrectOpt
                                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/40'
                                      : isChosen && feedbackState === 'wrong'
                                      ? 'bg-rose-600 text-white ring-4 ring-rose-400/40'
                                      : 'bg-slate-800/90 text-white hover:bg-violet-600 border border-slate-700 hover:border-violet-500'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* 2. MATH: MULTIPLICACIÓN ESPACIAL */}
                  {currentMission.subject === 'math' &&
                    currentMission.visualData?.operator === 'x' && (
                      <div className="space-y-6">
                        <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 text-center">
                          <span className="text-xs text-slate-400 font-semibold block mb-4">
                            Flota Espacial: {currentMission.visualData.count1} Escuadrones ×{' '}
                            {currentMission.visualData.count2} Cohetes
                          </span>
                          <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
                            {Array.from({ length: currentMission.visualData.count1 || 0 }).map(
                              (_, squadIdx) => (
                                <div
                                  key={squadIdx}
                                  className="p-3 bg-violet-950/30 border border-violet-800/40 rounded-xl"
                                >
                                  <span className="text-[10px] text-violet-300 font-bold block mb-1">
                                    Nave #{squadIdx + 1}
                                  </span>
                                  <div className="flex flex-wrap justify-center gap-1 text-2xl">
                                    {Array.from({
                                      length: currentMission.visualData?.count2 || 0,
                                    }).map((_, i) => (
                                      <span key={i} className="animate-pulse">
                                        {getItemEmoji(currentMission.visualData?.itemType)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                            Total en la misión cósmica:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {currentMission.visualData.options?.map((opt) => {
                              const isChosen = selectedOption === opt;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleCheckAnswer(opt)}
                                  className={`p-4 rounded-xl font-black text-2xl transition-all shadow-md transform hover:-translate-y-1 ${
                                    isChosen && feedbackState === 'correct'
                                      ? 'bg-emerald-600 text-white'
                                      : isChosen && feedbackState === 'wrong'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-800 text-white hover:bg-violet-600 border border-slate-700'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* 3. READING: FONÉTICA Y FORMACIÓN DE PALABRAS */}
                  {currentMission.subject === 'reading' && (
                    <div className="space-y-6">
                      <div className="bg-slate-950/60 p-8 rounded-xl border border-slate-800 text-center">
                        <span className="text-xs text-slate-400 font-semibold block mb-4">
                          Descubre la palabra mágica
                        </span>
                        <div className="text-3xl sm:text-5xl font-black tracking-widest text-violet-300 font-mono">
                          {currentMission.visualData?.missingWord || currentMission.title}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              const audioTarget =
                                currentMission.visualData?.missingWord || currentMission.title;
                              speakText(audioTarget);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-900/40 text-violet-300 hover:text-white border border-violet-800 text-xs font-semibold"
                          >
                            <Volume2 className="w-4 h-4" />
                            <span>Escuchar Fonemas</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                          Selecciona la opción correcta:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {currentMission.visualData?.options?.map((opt) => {
                            const isChosen = selectedOption === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleCheckAnswer(opt)}
                                className={`p-4 rounded-xl font-black text-xl sm:text-2xl transition-all shadow-md transform hover:-translate-y-1 ${
                                  isChosen && feedbackState === 'correct'
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/40'
                                    : isChosen && feedbackState === 'wrong'
                                    ? 'bg-rose-600 text-white ring-4 ring-rose-400/40'
                                    : 'bg-slate-800 text-white hover:bg-violet-600 border border-slate-700'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. TRACING: PRÁCTICA DE TRAZO GUIADO */}
                  {currentMission.subject === 'tracing' && (
                    <div className="space-y-4">
                      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-center">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400 font-semibold">
                            Traza con tu dedo o ratón siguiendo la guía:
                          </span>
                          <button
                            onClick={clearCanvas}
                            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded bg-rose-950/40 border border-rose-800/40"
                          >
                            <Eraser className="w-3.5 h-3.5" />
                            <span>Limpiar Pizarra</span>
                          </button>
                        </div>

                        <div className="relative mx-auto w-full max-w-sm h-64 bg-slate-900 border-2 border-dashed border-violet-500/40 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner cursor-crosshair">
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 text-9xl font-black text-violet-400 font-serif select-none">
                            {currentMission.visualData?.traceChar || 'S'}
                          </div>

                          <canvas
                            ref={canvasRef}
                            width={380}
                            height={256}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="absolute inset-0 w-full h-full z-10 touch-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleValidateTracing}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Validar Trazo con Tutor Lumi</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 5. GRAMMAR: RETOS DE GRAMÁTICA, ORTOGRAFÍA Y SINTAXIS */}
                  {currentMission.subject === 'grammar' && (
                    <div className="space-y-6">
                      <div className="bg-slate-950/70 p-6 sm:p-8 rounded-2xl border border-indigo-500/30 text-center relative overflow-hidden shadow-inner">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-bold mb-4">
                          <span>📚 Reto de Gramática · {currentMission.category}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mb-2">
                          Lee con atención la frase o palabra destacada:
                        </p>
                        <div className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-fuchsia-200 py-3 px-4 max-w-xl mx-auto leading-relaxed border border-violet-800/30 rounded-xl bg-slate-900/50">
                          « {currentMission.description || currentMission.title} »
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                          Toca la opción correcta:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {currentMission.visualData?.options?.map((opt) => {
                            const isChosen = selectedOption === opt;
                            const isCorrectOpt =
                              String(opt).trim().toLowerCase() ===
                              String(currentMission.visualData?.correctAnswer).trim().toLowerCase();
                            return (
                              <button
                                key={opt}
                                onClick={() => handleCheckAnswer(opt)}
                                className={`p-4 rounded-xl font-black text-base sm:text-lg transition-all shadow-md transform hover:-translate-y-0.5 text-left flex items-center justify-between ${
                                  isChosen && feedbackState === 'correct' && isCorrectOpt
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/40 shadow-emerald-600/30'
                                    : isChosen && feedbackState === 'wrong'
                                    ? 'bg-rose-600 text-white ring-4 ring-rose-400/40 shadow-rose-600/30'
                                    : 'bg-slate-800/90 text-white hover:bg-violet-600/80 border border-slate-700 hover:border-violet-500'
                                }`}
                              >
                                <span>{opt}</span>
                                {isChosen && feedbackState === 'correct' && (
                                  <CheckCircle className="w-5 h-5 text-white shrink-0" />
                                )}
                                {isChosen && feedbackState === 'wrong' && (
                                  <XCircle className="w-5 h-5 text-white shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. GENERAL OPTION-BASED MATH (DIVISION, FRACCIONES, RELOJ, GEOMETRÍA) */}
                  {currentMission.subject === 'math' &&
                    currentMission.visualData?.operator !== '+' &&
                    currentMission.visualData?.operator !== '-' &&
                    currentMission.visualData?.operator !== 'x' &&
                    currentMission.visualData?.options && (
                      <div className="space-y-6">
                        <div className="bg-slate-950/70 p-6 sm:p-8 rounded-2xl border border-violet-500/30 text-center relative overflow-hidden shadow-inner">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-700/50 text-violet-300 text-xs font-bold mb-3">
                            <span>📐 Reto Matemático · {currentMission.category}</span>
                          </div>
                          <p className="text-base sm:text-lg text-slate-200 font-semibold max-w-lg mx-auto">
                            {currentMission.description}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                            Selecciona el resultado correcto:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {currentMission.visualData.options.map((opt) => {
                              const isChosen = selectedOption === opt;
                              const isCorrectOpt =
                                String(opt).trim().toLowerCase() ===
                                String(currentMission.visualData?.correctAnswer).trim().toLowerCase();
                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleCheckAnswer(opt)}
                                  className={`p-4 rounded-xl font-black text-xl transition-all shadow-md transform hover:-translate-y-0.5 ${
                                    isChosen && feedbackState === 'correct' && isCorrectOpt
                                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/40'
                                      : isChosen && feedbackState === 'wrong'
                                      ? 'bg-rose-600 text-white ring-4 ring-rose-400/40'
                                      : 'bg-slate-800 text-white hover:bg-violet-600 border border-slate-700'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* 7. FALLBACK MULTIPLE CHOICE */}
                  {currentMission.subject !== 'tracing' &&
                    currentMission.subject !== 'grammar' &&
                    !(
                      currentMission.subject === 'math' &&
                      (currentMission.visualData?.operator === '+' ||
                        currentMission.visualData?.operator === '-' ||
                        currentMission.visualData?.operator === 'x')
                    ) &&
                    currentMission.subject !== 'reading' &&
                    currentMission.visualData?.options && (
                      <div className="space-y-6">
                        <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800 text-center">
                          <p className="text-sm text-slate-300 font-medium max-w-md mx-auto">
                            {currentMission.description}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                            Elige una respuesta:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {currentMission.visualData.options.map((opt) => {
                              const isChosen = selectedOption === opt;
                              const isCorrectOpt =
                                String(opt).trim().toLowerCase() ===
                                String(currentMission.visualData?.correctAnswer).trim().toLowerCase();
                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleCheckAnswer(opt)}
                                  className={`p-4 rounded-xl font-bold text-base transition-all shadow-md ${
                                    isChosen && feedbackState === 'correct' && isCorrectOpt
                                      ? 'bg-emerald-600 text-white'
                                      : isChosen && feedbackState === 'wrong'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-800 text-white hover:bg-violet-600 border border-slate-700'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* CELEBRATION REWARD BANNER */}
                {celebrationGems !== null && (
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/50 flex items-center justify-between animate-bounce">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Award className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base">
                          ¡Juego #{currentMission.level} Completado!
                        </h4>
                        <p className="text-xs text-emerald-300">
                          Has ganado +{celebrationGems} gemas doradas. ¡Tu racha diaria aumenta!
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleNavNextMission}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                    >
                      <span>Siguiente Juego</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Socratic AI Tutor Panel & Chat (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full min-h-[520px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-2xl shadow-md text-white">
                      🦉
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">Lumi (Tu Mejor Amigo y Compañero)</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 font-semibold border border-violet-800/60">
                        IA Amiga
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Conversa conmigo como tu mejor amigo o juguemos juntos
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const lastTutorMsg = [...chatMessages]
                      .reverse()
                      .find((m) => m.sender === 'tutor');
                    if (lastTutorMsg) handleToggleVoicePlay(lastTutorMsg.text);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    isPlayingVoice
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md ring-2 ring-rose-400 animate-pulse'
                      : 'text-violet-400 hover:text-white hover:bg-violet-950/60 border-violet-800/40'
                  }`}
                  title={
                    isPlayingVoice
                      ? 'Detener la voz que está sonando'
                      : 'Escuchar la voz de tu amigo Lumi'
                  }
                >
                  {isPlayingVoice ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span className="hidden sm:inline">Detener</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-violet-400" />
                      <span className="hidden sm:inline">Escuchar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Friendly Conversation Quick Prompts */}
              <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-800/60">
                <button
                  onClick={() => handleSendQuestion('¡Hola amigo! ¿Qué hacemos hoy juntos?')}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-950/60 hover:bg-pink-900/80 border border-pink-800/50 text-[11px] font-bold text-pink-300 transition-colors"
                >
                  <span>💬 Charlemos</span>
                </button>

                <button
                  onClick={() => handleSendQuestion('¡Hola amigo Lumi! Cuéntame un chiste divertido')}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/50 text-[11px] font-bold text-amber-300 transition-colors"
                >
                  <span>😂 Chiste</span>
                </button>

                <button
                  onClick={() => handleAskSocraticMode('hint')}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-950/60 hover:bg-violet-900/80 border border-violet-800/50 text-[11px] font-semibold text-violet-300 transition-colors"
                >
                  <Lightbulb className="w-3 h-3 text-amber-400" />
                  <span>Dame una pista</span>
                </button>

                <button
                  onClick={() => handleAskSocraticMode('explain_visual')}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/50 text-[11px] font-semibold text-indigo-300 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Con dibujitos</span>
                </button>

                <button
                  onClick={() => handleAskSocraticMode('cheer')}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/50 text-[11px] font-semibold text-emerald-300 transition-colors"
                >
                  <Smile className="w-3 h-3 text-emerald-400" />
                  <span>¡Dame ánimos!</span>
                </button>
              </div>

              {/* Chat Messages Flow */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 max-h-80 scrollbar-thin">
                {chatMessages.map((msg) => {
                  const isTutor = msg.sender === 'tutor';
                  const isThisMsgSpeaking = isPlayingVoice && currentlySpeakingText === msg.text;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${
                        isTutor ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      {isTutor && (
                        <div className="w-7 h-7 rounded-lg bg-violet-900/50 text-base flex items-center justify-center shrink-0 border border-violet-800/50">
                          🦉
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          isTutor
                            ? 'bg-slate-800/90 text-slate-100 border border-slate-700/60'
                            : 'bg-violet-600 text-white rounded-tr-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                        {isTutor && student.soundEnabled && (
                          <button
                            onClick={() => handleToggleVoicePlay(msg.text)}
                            className="mt-1.5 text-[10px] text-violet-400 hover:text-white flex items-center gap-1 font-semibold"
                          >
                            {isThisMsgSpeaking ? (
                              <>
                                <Square className="w-3 h-3 text-rose-400 fill-rose-400" />
                                <span className="text-rose-400">Detener Voz</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-violet-400" />
                                <span>Poner Play</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isTutorThinking && (
                  <div className="flex items-center gap-2 text-violet-400 text-xs italic p-2">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                    <span>Lumi te está escuchando con atención y cariño como tu mejor amigo...</span>
                  </div>
                )}
              </div>

              {/* Chat Input & Voice Recognition */}
              <div className="border-t border-slate-800 pt-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendQuestion();
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={handleToggleMic}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isListening
                        ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700'
                    }`}
                    title={isListening ? 'Detener micrófono' : 'Hablar con tu amigo Lumi por voz'}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={inputQuestion}
                    onChange={(e) => setInputQuestion(e.target.value)}
                    placeholder="Háblale o escríbele a tu amigo Lumi (cuéntale tu día, un chiste o tus dudas)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />

                  <button
                    type="submit"
                    disabled={!inputQuestion.trim() || isTutorThinking}
                    className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: CATÁLOGO Y MAPA DE LOS 100 JUEGOS */}
      {activeSubTab === 'adventure' && (
        <div className="space-y-6">
          {/* Worlds Overview Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {WORLDS_100_INFO.map((w) => {
              const worldGames = missions.filter((m) => m.worldNumber === w.number);
              const completedCount = worldGames.filter((m) => m.completed).length;
              const totalInWorld = worldGames.length || 20;
              const isSelected = selectedWorld === w.number;

              return (
                <div
                  key={w.number}
                  onClick={() => setSelectedWorld(isSelected ? 0 : w.number)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all transform hover:-translate-y-1 ${
                    isSelected
                      ? 'bg-violet-950/80 border-violet-400 ring-2 ring-violet-500/40 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-2xl mb-1">
                    <span>{w.icon}</span>
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-950/90 px-2 py-0.5 rounded-md border border-violet-800">
                      Mundo {w.number}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white line-clamp-1">{w.name}</h4>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {completedCount} / {totalInWorld} Superados
                    </span>
                    <span className="font-bold text-emerald-400">
                      {Math.round((completedCount / (totalInWorld || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${(completedCount / (totalInWorld || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search, Filter Bar and 100 Games Matrix */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-violet-400" />
                  <span>Los 100 Juegos Educativos (50 Matemáticas + 50 Gramática)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedWorld === 0
                    ? 'Explorando los 5 mundos al completo (Matemáticas y Gramática alternadas al azar)'
                    : `Filtrando por Mundo ${selectedWorld}: ${
                        WORLDS_100_INFO[selectedWorld - 1]?.name || ''
                      }`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={handleShuffleRandomAlternation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-xs font-black shadow-md shadow-violet-600/30 transition-all transform hover:scale-105 active:scale-95"
                  title="Alternar de forma aleatoria los 50 juegos de matemáticas y los 50 de gramática"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>🎲 Alternar Random</span>
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 hidden sm:inline">Progreso:</span>
                  <span className="font-extrabold text-violet-400 bg-violet-950 px-3 py-1.5 rounded-xl border border-violet-800">
                    {missions.filter((m) => m.completed).length} / {missions.length} Superados
                  </span>
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: `Todos (${missions.length})` },
                  {
                    id: 'math',
                    label: `Matemáticas (${missions.filter((m) => m.subject === 'math').length})`,
                  },
                  {
                    id: 'grammar',
                    label: `Gramática (${
                      missions.filter((m) => m.subject === 'grammar').length
                    })`,
                  },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      categoryFilter === cat.id
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search and Status Dropdown */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-60">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar juego (ej: manzana, globo, memoria)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-violet-500"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="completed">Superados</option>
                  <option value="pending">Por Jugar</option>
                </select>
              </div>
            </div>

            {/* 50 Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {filtered50Games.map((m) => {
                const isCurrent = m.id === currentMission.id;
                const isCompleted = m.completed;

                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectMission(m.id);
                      setActiveSubTab('mission');
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all transform hover:-translate-y-1 ${
                      isCurrent
                        ? 'bg-violet-950/60 border-violet-500 ring-2 ring-violet-500/40 shadow-lg shadow-violet-500/20'
                        : isCompleted
                        ? 'bg-emerald-950/30 border-emerald-800/60 hover:border-emerald-500'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-violet-300 uppercase">
                          Nivel {m.level}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            m.subject === 'math'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                              : m.subject === 'grammar'
                              ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800/60'
                              : 'bg-violet-950 text-violet-300 border border-violet-800/60'
                          }`}
                        >
                          {m.subject === 'math' ? '🧮 Mate' : m.subject === 'grammar' ? '📚 Gram' : m.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < m.stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700 fill-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h4 className="font-extrabold text-white text-xs line-clamp-1">{m.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {m.category} · {m.difficulty}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-violet-400 font-bold flex items-center gap-0.5 text-[11px]">
                        <Gem className="w-3 h-3 fill-violet-400" /> +{m.gemReward}
                      </span>

                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? 'Superado' : 'Jugar'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: ZONA DE RECREO Y MASCOTA VIRTUAL */}
      {activeSubTab === 'pet_zone' && (
        <VirtualPetCareZone
          pet={pet}
          onUpdatePet={onUpdatePet}
          student={student}
          onUpdateStudent={onUpdateStudent}
          onAddToast={onAddToast}
        />
      )}

      {/* VIEW D: JUEGOS AVANZADOS VIP CON CANJE DE GEMAS POR MINUTOS */}
      {activeSubTab === 'arcade_vip' && (
        <AdvancedArcadeZone
          student={student}
          onUpdateStudent={onUpdateStudent}
          onAddToast={onAddToast}
          onNavigateToMissions={() => {
            setActiveSubTab('mission');
          }}
        />
      )}
    </div>
  );
};
