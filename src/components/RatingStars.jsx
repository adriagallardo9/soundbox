import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({
  value = 0,
  onChange = null,
  max = 5,
  size = 'md',
  showNumber = false,
  interactive = false
}) {
  const [hoverValue, setHoverValue] = useState(null);

  const displayValue = hoverValue !== null ? hoverValue : Number(value) || 0;

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  const handleClick = (index) => {
    if (interactive && onChange) {
      onChange(index);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5" role={interactive ? "radiogroup" : "img"} aria-label={`Puntuació: ${displayValue} de ${max} estrelles`}>
      <div className="flex items-center">
        {[...Array(max)].map((_, i) => {
          const starNumber = i + 1;
          const isFilled = displayValue >= starNumber;
          const isHalf = !isFilled && displayValue >= starNumber - 0.5;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starNumber)}
              onMouseEnter={() => interactive && setHoverValue(starNumber)}
              onMouseLeave={() => interactive && setHoverValue(null)}
              className={`p-0.5 rounded transition-transform ${
                interactive ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400' : 'cursor-default'
              }`}
              aria-label={`${starNumber} estrelles`}
            >
              <div className="relative">
                {/* Empty Background Star */}
                <Star className={`${currentSize} text-slate-700`} fill="currentColor" />

                {/* Filled Star */}
                {isFilled && (
                  <Star
                    className={`absolute inset-0 ${currentSize} text-emerald-400 fill-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]`}
                  />
                )}

                {/* Half Star */}
                {isHalf && (
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star
                      className={`${currentSize} text-emerald-400 fill-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]`}
                    />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="font-semibold text-sm text-emerald-400 ml-1">
          {displayValue > 0 ? displayValue.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
}
