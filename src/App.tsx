import { useState, useRef, useEffect, RefObject } from "react";
import { motion, AnimatePresence, useAnimation } from "motion/react";
import { Sparkles, X, Gift, RefreshCw, Volume2, VolumeX } from "lucide-react";

const PRIZES = [
  "買大冰折10元",
  "免費加珍珠",
  "下次消費9折",
  "隱藏版淋醬",
  "免費加芋圓",
  "芒果冰沙半價",
];

const COLORS = [
  "#A28FC5", // Taro
  "#B8A9D6", // Light Taro
  "#D1C4E9", // Lighter
  "#A28FC5", // Repeat pattern
  "#B8A9D6",
  "#D1C4E9",
];

const SOUNDS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
  spin: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
};

export default function App() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const controls = useAnimation();

  // Audio References
  const clickAudio = useRef<HTMLAudioElement | null>(null);
  const spinAudio = useRef<HTMLAudioElement | null>(null);
  const winAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    clickAudio.current = new Audio(SOUNDS.click);
    spinAudio.current = new Audio(SOUNDS.spin);
    winAudio.current = new Audio(SOUNDS.win);

    // Preload
    clickAudio.current.load();
    spinAudio.current.load();
    winAudio.current.load();

    return () => {
      clickAudio.current = null;
      spinAudio.current = null;
      winAudio.current = null;
    };
  }, []);

  const playSound = (audioRef: RefObject<HTMLAudioElement | null>) => {
    if (!isMuted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {}); // Catch browser interaction blocks
    }
  };

  const spin = async () => {
    if (isSpinning) return;

    playSound(clickAudio);
    setIsSpinning(true);
    setResult(null);

    // Play spin sound
    if (!isMuted && spinAudio.current) {
      spinAudio.current.currentTime = 0;
      spinAudio.current.loop = true;
      spinAudio.current.play().catch(() => {});
    }

    // Calculate a random rotation: at least 5 full spins + extra degrees
    const extraDegrees = Math.floor(Math.random() * 360);
    const newRotation = rotation + (360 * 5) + extraDegrees;
    
    setRotation(newRotation);

    await controls.start({
      rotate: newRotation,
      transition: {
        duration: 4,
        ease: [0.15, 0, 0.15, 1],
      },
    });

    // Stop spin sound
    if (spinAudio.current) {
      spinAudio.current.pause();
      spinAudio.current.loop = false;
    }

    const finalDegree = newRotation % 360;
    const segmentAngle = 360 / PRIZES.length;
    const winningIndex = Math.floor((360 - finalDegree) / segmentAngle) % PRIZES.length;
    
    setResult(PRIZES[winningIndex]);
    playSound(winAudio);
    setIsSpinning(false);
  };

  const reset = () => {
    playSound(clickAudio);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-milk font-sans text-stone-800 flex flex-col items-center justify-center p-6 select-none overflow-hidden relative">
      {/* Mute Toggle */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-6 right-6 z-40 p-3 bg-white rounded-full shadow-lg text-taro hover:bg-taro hover:text-white transition-all border border-taro/10"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="text-taro font-bold tracking-widest uppercase text-xs mb-2 block">
          Artisanal Sweets
        </span>
        <h1 className="font-serif text-5xl md:text-6xl text-taro italic mb-4">
          QQ田 驚喜抽抽樂
        </h1>
        <p className="text-stone-500 max-w-xs mx-auto">
          今天想加什麼好料？轉轉輪盤，領取您的專屬驚喜！
        </p>
      </motion.div>

      {/* Wheel Container */}
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        {/* Pointer */}
        <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 z-20">
          <motion.div
            animate={isSpinning ? { rotate: [0, -10, 10, -5, 5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.2 }}
          >
            <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow-lg">
              <path d="M50 100 L100 0 L0 0 Z" fill="#FFB347" />
            </svg>
          </motion.div>
        </div>

        {/* The Wheel */}
        <motion.div
          animate={controls}
          className="w-full h-full rounded-full border-8 border-taro shadow-2xl relative overflow-hidden bg-taro-light"
          style={{ transformOrigin: "center" }}
        >
          {PRIZES.map((prize, i) => {
            const angle = 360 / PRIZES.length;
            const rotationDegree = i * angle;
            return (
              <div
                key={i}
                className="absolute top-0 left-0 w-full h-full origin-center"
                style={{
                  transform: `rotate(${rotationDegree}deg)`,
                  backgroundColor: COLORS[i],
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((Math.PI / 180) * (90 - angle / 2))}% ${50 - 50 * Math.sin((Math.PI / 180) * (90 - angle / 2))}%, ${50 + 50 * Math.cos((Math.PI / 180) * (90 + angle / 2))}% ${50 - 50 * Math.sin((Math.PI / 180) * (90 + angle / 2))}%)`
                }}
              >
                <div 
                  className="absolute top-[15%] left-1/2 -translate-x-1/2 text-white font-bold text-center text-xs md:text-sm vertical-text"
                >
                  <span className="block whitespace-nowrap [writing-mode:vertical-rl] tracking-widest">
                    {prize}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-mango shadow-inner z-10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-mango" />
          </div>
        </motion.div>
      </div>

      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isSpinning}
        onClick={spin}
        className={`mt-16 px-10 py-4 rounded-full font-bold text-xl shadow-lg transition-colors flex items-center gap-3
          ${isSpinning 
            ? "bg-stone-300 text-stone-500 cursor-not-allowed" 
            : "bg-taro text-white hover:bg-taro-light"}`}
      >
        {isSpinning ? (
          <>
            <RefreshCw className="animate-spin" />
            旋轉中...
          </>
        ) : (
          <>
            <Sparkles className="text-mango" />
            點我開始領驚喜！
          </>
        )}
      </motion.button>

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-taro/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative border-b-8 border-mango"
            >
              <button 
                onClick={reset}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-20 h-20 bg-mango/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-mango" />
              </div>

              <h3 className="text-stone-400 font-bold uppercase tracking-widest text-sm mb-2">手氣太好了！</h3>
              <div className="font-serif text-3xl md:text-4xl text-taro italic mb-8">
                {result}
              </div>

              <button
                onClick={reset}
                className="w-full bg-taro text-white font-bold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all"
              >
                太棒了，領取優惠！
              </button>
              
              <p className="mt-4 text-[10px] text-stone-400 italic">
                * 最終解釋權歸 QQ田手做甜點 所有
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="fixed -bottom-20 -left-20 w-80 h-80 bg-mango/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -top-10 -right-20 w-60 h-60 bg-taro/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
