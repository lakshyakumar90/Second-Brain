'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type LandingButtonProps = {
  children?: React.ReactNode;
  onClick?: () => void;
  link?: string;
  dark?: boolean; // true = dark bg, false = green bg
};

const LandingButton: React.FC<LandingButtonProps> = ({
  children = 'About Us',
  onClick,
  dark = true,
  link,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  // Magnetic effect
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const btn = ref.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const range = 80;
      if (dist < range) {
        // Intensity controls magnet "strength"
        const intensity = 0.35;
        const x = dx * intensity;
        const y = dy * intensity;
        setPos({ x, y });
      } else {
        setPos({ x: 0, y: 0 });
      }
    };
    const reset = () => setPos({ x: 0, y: 0 });

    document.addEventListener('mousemove', handleMouse);
    if (ref.current) {
      ref.current.addEventListener('mouseleave', reset);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouse);
      if (ref.current) {
        ref.current.removeEventListener('mouseleave', reset);
      }
    };
  }, []);

  // Colors
  const bg = dark ? 'bg-[#131f0d]' : 'bg-[#8ffe93]';
  const color = dark ? 'text-white' : 'text-[#121212]';

  // Arrow color logic for hover
  // On hover, always use #121212 (black) for the arrow, else use the default
  const arrowStroke = hovered ? '#121212' : (dark ? '#8ffe93' : '#121212');

  return (
    <Link to={link || ''}>
    <button
      ref={ref}
      className={`
        rounded-full 
        px-6 py-2
        font-semibold text-lg
        flex items-center gap-2
        transition-colors duration-200
        shadow-md 
        outline-none border-none
        cursor-pointer
        ${bg} ${color}
        hover:bg-[#84f58b] hover:text-black
        group
      `}
      style={{
        willChange: 'transform',
        boxShadow: '0 2px 16px rgba(0,0,0,.04)',
        position: 'relative',
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: 'background 0.2s, color 0.2s, transform 0.18s cubic-bezier(0.22,0.61,0.36,1)'
      }}
      onClick={onClick}
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="font-semibold">{children}</span>
      <svg
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill="none"
        stroke={arrowStroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1 transition-colors duration-200"
        style={{
          transition: 'stroke 0.2s cubic-bezier(0.22,0.61,0.36,1)'
        }}
      >
        <path d="M5 12h14m0 0l-5-5m5 5l-5 5" />
      </svg>
    </button></Link>
  );
};

export default LandingButton;
