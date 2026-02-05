import React, { useState } from "react";

interface CoinImageProps {
  iconUrl?: string;
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 sm:w-5 sm:h-5",
  md: "w-5 h-5 sm:w-8 sm:h-8",
  lg: "w-8 h-8 sm:w-12 sm:h-12",
};

const textSizes = {
  sm: "text-[6px] sm:text-[8px]",
  md: "text-[8px] sm:text-xs",
  lg: "text-xs sm:text-base",
};

// Generate a consistent color from symbol string
const getColorFromSymbol = (symbol: string): string => {
  const colors = [
    "bg-[#2AC2FF]",
    "bg-[#9B6DFF]",
    "bg-[#FFD43B]",
    "bg-[#FF6B6B]",
    "bg-[#4ECDC4]",
    "bg-[#45B7D1]",
    "bg-[#96CEB4]",
    "bg-[#FFEAA7]",
  ];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (symbol: string): string => {
  return symbol.slice(0, 2).toUpperCase();
};

const CoinImage: React.FC<CoinImageProps> = ({
  iconUrl,
  symbol,
  size = "md",
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const showFallback = !iconUrl || imageError;

  if (showFallback) {
    return (
      <span
        className={`${sizeClasses[size]} ${getColorFromSymbol(symbol)} rounded-full inline-flex items-center justify-center flex-shrink-0 border border-[#1a1a1a]/10 ${className}`}
      >
        <span className={`${textSizes[size]} font-black text-white`}>
          {getInitials(symbol)}
        </span>
      </span>
    );
  }

  return (
    <span className={`${sizeClasses[size]} relative inline-flex flex-shrink-0 ${className}`}>
      {!imageLoaded && (
        <span
          className={`absolute inset-0 ${getColorFromSymbol(symbol)} rounded-full animate-pulse`}
        />
      )}
      <img
        src={iconUrl}
        alt={symbol}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        className={`w-full h-full rounded-full object-cover border border-[#1a1a1a]/10 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-200`}
      />
    </span>
  );
};

export default CoinImage;
