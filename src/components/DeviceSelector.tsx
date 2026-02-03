"use client";
import { createPortal } from "react-dom";
import { Mic, Headphones, Check } from "lucide-react";
import { useEffect, useState } from "react";

export const DeviceSelector = ({
  microphones,
  speakers,
  activeMic,
  activeSpeaker,
  onSelect,
  anchorRect, // Hum button ki position pass karenge
  onClose
}: any) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div 
      className="inset-0 z-[999999] " 
      onClick={onClose} // Bahar click karne par band
    >
      <div 
        className="relative w-64 h-ful bg-[#111214] border border-white/10 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200"
        style={{ 
          bottom: window.innerHeight - anchorRect.top - 30 , // Button ke upar
          left: anchorRect.left + 0 // Button ke thora peeche
        }}
        onClick={(e) => e.stopPropagation()} // Menu ke andar click pe band na ho
      >
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase mb-2 px-2 flex items-center gap-2">
              <Mic size={12} /> Input Device
            </p>
            <div className="max-h-32 overflow-y-auto custom-scrollbar">
              {microphones.map((device: any) => (
                <button
                  key={device.deviceId}
                  onClick={() => onSelect('audioinput', device.deviceId)}
                  className={`w-full flex items-center justify-between px-2 py-2 rounded text-[11px] mb-0.5 ${
                    activeMic === device.deviceId ? 'bg-[#5865f2] text-white' : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <span className="truncate">{device.label}</span>
                  {activeMic === device.deviceId && <Check size={12} />}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-white/5" />

          <div>
            <p className="text-[10px] font-medium text-gray-500 uppercase mb-2 px-2 flex items-center gap-2">
              <Headphones size={12} /> Output Device
            </p>
            <div className="max-h-full overflow-hidden">
              {speakers.map((device: any) => (
                <button
                  key={device.deviceId}
                  onClick={() => onSelect('audiooutput', device.deviceId)}
                  className={`w-full flex items-center justify-between px-2 py-2 rounded text-[11px] mb-0.5 ${
                    activeSpeaker === device.deviceId ? 'bg-[#5865f2] text-white' : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <span className="truncate">{device.label}</span>
                  {activeSpeaker === device.deviceId && <Check size={12} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body // 👈 Yeh magic hai, yeh pure dashboard se bahar body mein chala jayega
  );
};