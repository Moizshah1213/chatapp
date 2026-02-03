"use client";
import { motion } from "framer-motion";

export const SpaceBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#020205] pointer-events-none">
      
      {/* 🌌 1. MAIN SCI-FI IMAGE (Animated Texture) */}
      <motion.div 
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute inset-0 opacity-70 mix-blend-screen bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('/background4.jpg')`,
          filter: 'brightness(0.9) contrast(1.2)'
        }}

      />

      {/* 🌫️ 2. NEBULA GLOW OVERLAY (To match the image) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(88,101,242,0.1)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(147,51,234,0.1)_0%,_transparent_50%)]" />

      {/* ✨ 3. SHARP TWINKLING STARS (Over the image) */}
     {[...Array(25)].map((_, i) => ( // 🟢 70 se hata kar 25 kar diya
  <motion.div
    key={`star-${i}`}
    className="absolute bg-white rounded-full z-[10]" 
    style={{
      // Sitaron ka size thora aur random kiya hai depth ke liye
      width: Math.random() * 3 + 1 + "px", 
      height: Math.random() * 3 + 1 + "px",
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      boxShadow: "0 0 12px 2px rgba(255,255,255,0.7)",
    }}
    animate={{ 
      opacity: [0.3, 1, 0.3],
      scale: [1, 1.2, 1]
    }}
    transition={{ 
      duration: Math.random() * 4 + 3, // Speed thori slow ki hai sukoon ke liye
      repeat: Infinity, 
      delay: Math.random() * 5 
    }}
  />
))}
      {/* 🪐 4. URANUS (Top-Right) 
     <motion.div
  animate={{ 
    y: [0, -15, 0], // Halka sa upar niche floating
    rotate: [0, 360] // 🔄 Infinity rotation
  }}
  transition={{ 
    y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
    rotate: { duration: 40, repeat: Infinity, ease: "linear" } // "linear" zaroori hai smooth ghumne ke liye
  }}
  className="absolute top-[25%] right-[10%] z-20"
>

  <div className="w-24 h-24 rounded-full relative overflow-hidden" 
    style={{
      background: "radial-gradient(circle at 30% 30%, #ace5ee, #4fb9d8 60%, #1d3557)",
      boxShadow: "inset -8px -8px 16px rgba(0,0,0,0.8), 0 0 25px rgba(172,229,238,0.2)"
    }}>
    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(transparent_2px,rgba(255,255,255,0.1)_4px)]" />
  </div>

  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[1px] bg-white/20 rounded-full rotate-[110deg] blur-[0.5px] pointer-events-none" />
</motion.div>*/}

      {/* ☄️ 6. FAST SHOOTING STARS 
      {[...Array(6)].map((_, i) => (
  <motion.div
    key={`shoot-${i}`}
    initial={{ x: "-20%", y: "-20%", opacity: 0 }}
    animate={{ 
      // 🚀 Har cycle mein random jagah se nikalne ka trick
      x: ["0%", "250%"], 
      y: ["0%", "250%"], 
      opacity: [0, 1, 1, 0] 
    }}
    transition={{ 
      duration: Math.random() * 1 + 0.8, // Speed thori random (tez)
      repeat: Infinity, 
      repeatDelay: i* 20, // 👈 Delay bohot kam kar diya (0 to 2s)
      ease: "linear",
      delay: i * 3 // Start mein gap rakha hai taake ek sath mela na lag jaye
    }}
    className="absolute w-[200px] h-[2px] bg-gradient-to-r from-transparent via-blue-100 to-white -rotate-[35deg] blur-[0.5px] z-[5]"
    style={{ 
      // 📍 Position fix: Isse har tara alag lane mein ayega
      top: `${(i * 35) % 100}%`, 
      left: `${(i * 15) % 100 - 20}%` 
    }}
  />
))}

      {/* 🌑 7. VIGNETTE EFFECT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_#020205_100%)] opacity-80" />
    </div>
  );
};