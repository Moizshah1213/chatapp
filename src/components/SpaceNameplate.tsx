"use client";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useEffect, useState, useRef } from "react";

export const SpaceNameplateOverlay = () => {
  const [animationData, setAnimationData] = useState(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    fetch("/Space.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(0.8); // 👈 Speed yahan control hogi
    }
  }, [animationData]);

  if (!animationData) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      
      {/* 🚀 ANIMATION WRAPPER */}
      <div className="absolute inset-0 flex items-center justify-center">
     
<div className="w-[300%] h-full flex items-center justify-center">
            <Lottie 
            animationData={animationData} 
            loop={true} 
            
            // 🟢 Scale ko adjust kiya taake stretch ho lekin cut na ho
            className="w-full h-full scale-y-[1.5] scale-x-[1.5] translate-y-[25%]" 
            style={{ width: '100%', height: 'auto' }}
            rendererSettings={{
              // 🚀 'meet' use kiya taake poori animation frame ke andar rahe
              preserveAspectRatio: 'xMidYMid meet', 
              focusable: false
            }}
          />
        </div>
     
      </div>

      {/* 🎨 Masking: Gradient overlay (Transparency thori barha di taake animation dikhe) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      
      {/* ✨ Left Edge Glow */}
    </div>
  );
};