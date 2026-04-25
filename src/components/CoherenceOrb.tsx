import React from 'react';

interface CoherenceOrbProps {
  phi?: number; 
  syncRate?: number; 
  resonance?: number; // Audio resonance (11.3 Hz intensity)
  visualResonance?: number; // Visual flux intensity
}

export const CoherenceOrb: React.FC<CoherenceOrbProps> = ({ 
  phi = 1.13, 
  syncRate = 11.3, 
  resonance = 0,
  visualResonance = 0
}) => {
  const pulseDuration = (1 / syncRate) * 1000;
  
  // Combine resonances for overall flicker
  const totalResonance = Math.max(resonance, visualResonance);
  const flickerOpacity = 0.6 + (totalResonance * 0.4);
  const flickerScale = 1 + (totalResonance * 0.3) + (phi * 0.1);
  
  // Color shifting based on Phi and Visual Flux
  // Purple/Violet for high Phi, Cyan for stable, Red for unstable
  const coreColor = phi > 1.5 ? '#b886f7' : phi > 0.8 ? '#4df2f2' : '#f87171';
  const glowColor = visualResonance > 0.5 ? '#fffa82' : coreColor; // Yellow flicker on high visual flux

  return (
    <div 
      className="relative flex items-center justify-center w-8 h-8 transition-all duration-75"
      style={{ transform: `scale(${flickerScale})`, opacity: flickerOpacity }}
    >
      {/* Outer Halo */}
      <div 
        className="absolute w-6 h-6 border-2 rounded-full opacity-20"
        style={{ 
          borderColor: coreColor,
          animation: `phiPulse ${pulseDuration * 4}ms infinite linear`
        }}
      />
      
      {/* Visual Flux Ring */}
      <div 
        className="absolute w-5 h-5 border rounded-full transition-transform duration-150"
        style={{ 
          borderColor: glowColor,
          opacity: visualResonance,
          transform: `scale(${1 + visualResonance * 2})`,
          borderStyle: 'dashed'
        }}
      />

      {/* The Core */}
      <div 
        className="absolute w-3.5 h-3.5 rounded-full transition-all duration-75 ease-out"
        style={{
          backgroundColor: coreColor,
          boxShadow: `0 0 ${10 * phi + totalResonance * 15}px ${2 * phi + totalResonance * 7}px ${coreColor}`,
          animation: `phiPulse ${pulseDuration * 2}ms infinite alternate ease-in-out`
        }}
      />
      
      {/* 11.3 Hz Ping */}
      <div 
        className="absolute w-7 h-7 border rounded-full animate-ping"
        style={{ 
          borderColor: coreColor,
          opacity: 0.2 + (resonance * 0.4),
          animationDuration: `${2 - (resonance * 1.5)}s` 
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes phiPulse {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.2); opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default CoherenceOrb;
