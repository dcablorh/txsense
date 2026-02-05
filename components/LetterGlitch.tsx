import React, { useEffect, useRef } from 'react';

interface LetterGlitchProps {
  text: string;
  glitchColors?: string[];
  glitchSpeed?: number;
  smooth?: boolean;
  centerVignette?: boolean;
  outerVignette?: boolean;
}

const LetterGlitch: React.FC<LetterGlitchProps> = ({
  text,
  glitchColors = ['#2ac2ff', '#9b6dff', '#ffd43b'],
  glitchSpeed = 50,
  smooth = true,
  centerVignette = true,
  outerVignette = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const glitchStateRef = useRef<Map<number, string>>(new Map());

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};<>.,0123456789';

  // Generate multiple lines of glitch text
  const generateGlitchLines = () => {
    const lines = [
      text.substring(0, 25).toUpperCase() || "DECODING HEX",
      "ANALYZING BLOCKCHAIN DATA...",
      "TRANSLATING TRANSACTIONS, I HAVE GOT TO MAKE IT EASY FOR YOU...",
      "PROCESSING ON-CHAIN EVENTS, JUST WAIT A LITTLE...",
      "FETCHING COIN METADATA, I HOPE YOU KNOW WHAT YOU ARE LOOKING FOR...",
      "GENERATING INTELLIGENCE, YHH I JUST GOT IT...",
      "SNIFFING OUT THE SMART CONTRACTS, DON’T MIND THE MESS...",
      "VERIFYING THE SOURCE CODE, TRUST BUT VERIFY, RIGHT?...",
      "CHECKING GAS PRICES, PREPARE YOUR WALLET FOR THE NEWS...",
      "AUDITING THE LIQUIDITY, JUST MAKING SURE IT’S NOT A MIRAGE...",
      "PEEKING INTO THE MEMPOOL, IT’S PRETTY CROWDED IN THERE...",
      "DECODING THE BYTES, IT’S LIKE SOLVING A PUZZLE NO ONE ASKED FOR...",
      "RECONSTRUCTING THE LEDGER, ONE BLOCK AT A TIME...",
      "SYNCING WITH THE NODES, THEY’RE TAKING THEIR SWEET TIME...",
      "HUNTING FOR HIDDEN GEMS, OR MAYBE JUST SOME ROCKS...",
      "CLEANING UP THE RAW DATA, IT WAS A BIT DUSTY...",
      "CALCULATING THE IMPERMANENT LOSS, TRY NOT TO CRY...",
      "MAPPING THE WHALES, DON’T GET SPLASHED..."
    ];
    return lines;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const lines = generateGlitchLines();

    const animate = () => {
      // Don't fill background - let white background show through
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Setup text
      const fontSize = Math.min(canvas.width / 30, 28);
      ctx.font = `bold ${fontSize}px Fredoka`;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      const lineHeight = fontSize * 1.8;
      const startY = (canvas.height - lines.length * lineHeight) / 2;
      const startX = 30;

      // Draw glitched text for each line
      lines.forEach((line, lineIndex) => {
        const y = startY + lineIndex * lineHeight;

        line.split('').forEach((char, charIndex) => {
          const globalIndex = lineIndex * 100 + charIndex;
          
          // Random glitch effect for each character
          const shouldGlitch = Math.random() < glitchSpeed / 100;
          
          let displayChar = char;
          if (shouldGlitch) {
            displayChar = characters[Math.floor(Math.random() * characters.length)];
            glitchStateRef.current.set(globalIndex, displayChar);
          } else if (glitchStateRef.current.has(globalIndex)) {
            glitchStateRef.current.delete(globalIndex);
          }

          // Random offset for glitch effect
          const offsetX = shouldGlitch ? (Math.random() - 0.5) * 15 : 0;
          const offsetY = shouldGlitch ? (Math.random() - 0.5) * 15 : 0;

          // Draw character with cycling colors
          const color = glitchColors[charIndex % glitchColors.length];
          ctx.fillStyle = color;
          ctx.globalAlpha = shouldGlitch ? 0.6 : 0.9;
          
          const charX = startX + charIndex * (fontSize * 0.55) + offsetX;
          const charY = y + offsetY;
          
          ctx.fillText(displayChar, charX, charY);
          ctx.globalAlpha = 1;
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [text, glitchColors, glitchSpeed, smooth, centerVignette, outerVignette]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{
        display: 'block',
        transition: smooth ? 'opacity 0.3s ease-in-out' : 'none',
        background: 'transparent',
      }}
    />
  );
};

export default LetterGlitch;
