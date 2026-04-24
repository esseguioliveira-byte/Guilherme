'use client';

import { useEffect, useState } from 'react';

export default function SpaceBackground() {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; duration: string; color: string }[]>([]);
  const [heroStars, setHeroStars] = useState<{ id: number; top: string; left: string; size: string; duration: string }[]>([]);

  useEffect(() => {
    // Background Stars (Dense clusters on the left)
    const newStars = Array.from({ length: 300 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 1.5 + 0.5}px`,
      duration: `${Math.random() * 5 + 2}s`,
      color: ['#fff', '#ffd7ba', '#bae1ff', '#ffb3ff'][Math.floor(Math.random() * 4)]
    }));
    setStars(newStars);

    // Hero stars with prominent spikes (placed like in the image)
    const heroPositions = [
      { top: '25%', left: '38%' },
      { top: '10%', left: '62%' },
      { top: '55%', left: '25%' },
      { top: '82%', left: '50%' },
      { top: '40%', left: '15%' },
    ];

    const newHeroStars = heroPositions.map((pos, i) => ({
      id: i,
      ...pos,
      size: `${Math.random() * 2 + 3}px`,
      duration: `${Math.random() * 2 + 2}s`
    }));
    setHeroStars(newHeroStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-[#000000]">
      {/* 1. Base Layer: Deep Blue to Black Gradient (Left to Right) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left_bottom,#050a1f_0%,#000000_100%)]" />

      {/* 2. Right Side: Large Cyan/Teal Nebula Clouds */}
      <div className="nebula w-[1500px] h-[1200px] bg-[#00e5ff]/10 -right-40 top-0 blur-[150px]" />
      <div className="nebula w-[1000px] h-[1000px] bg-[#008cff]/10 right-0 bottom-0 blur-[120px]" />
      <div className="nebula w-[800px] h-[800px] bg-[#00ffcc]/5 top-1/4 right-[10%] blur-[100px]" />

      {/* 3. Central: The 'Mystic Mountain' Pillar Structure */}
      {/* Main Dark Body */}
      <div className="absolute top-[20%] left-[42%] w-[250px] h-[600px] bg-[#0a0502] blur-[40px] rotate-[5deg] opacity-90 rounded-full" />
      <div className="absolute top-[35%] left-[45%] w-[180px] h-[400px] bg-[#1a0f05] blur-[30px] -rotate-[10deg] opacity-80 rounded-full" />
      
      {/* Golden Highlight Edges (Illuminated gas) */}
      <div className="nebula w-[300px] h-[500px] bg-[#ffcc33]/20 left-[41%] top-[25%] blur-[60px] mix-blend-color-dodge" />
      <div className="nebula w-[200px] h-[300px] bg-[#ff6600]/15 left-[46%] top-[40%] blur-[40px]" />
      <div className="nebula w-[150px] h-[200px] bg-[#00e5ff]/20 left-[48%] top-[30%] blur-[30px]" />

      {/* 4. Small Detailed Highlights (Star-forming regions) */}
      <div className="absolute top-[30%] left-[48%] w-4 h-4 bg-white blur-xl opacity-60" />
      <div className="absolute top-[45%] left-[44%] w-6 h-6 bg-[#ffaa00] blur-2xl opacity-40" />

      {/* 5. Background Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            '--duration': star.duration,
            opacity: Math.random() * 0.7 + 0.3
          } as any}
        />
      ))}

      {/* 6. Hero Stars (Prominent Magenta Spikes) */}
      {heroStars.map((star) => (
        <div
          key={`hero-${star.id}`}
          className="star-spike"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            '--duration': star.duration,
          } as any}
        >
           {/* Multi-point Spikes */}
           <div className="absolute inset-0" style={{ '--rotation': '0deg' } as any} />
           <div className="absolute inset-0" style={{ '--rotation': '45deg' } as any} />
           <div className="absolute inset-0" style={{ '--rotation': '90deg' } as any} />
           <div className="absolute inset-0" style={{ '--rotation': '135deg' } as any} />
           {/* Central Core Glow */}
           <div className="absolute inset-[-4px] bg-white rounded-full blur-[2px] opacity-80" />
           <div className="absolute inset-[-10px] bg-[#ff00ea]/30 rounded-full blur-[6px]" />
        </div>
      ))}

      {/* 7. Bottom Fog/Dust */}
      <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-black via-black/40 to-transparent z-0" />
    </div>
  );
}
