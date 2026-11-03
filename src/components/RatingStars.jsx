export default function RatingStars({
  value = 0,
  onChange = null,
  max = 5,
  size = 'md',
  showNumber = false,
  interactive = false
}) {
  const displayValue = Number(value) || 0;
  const formattedValue = displayValue > 0
    ? Number(displayValue.toFixed(2)).toLocaleString('ca-ES')
    : '—';

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={interactive
        ? 'inline-grid w-64 max-w-full grid-cols-[minmax(0,1fr)_2.5rem] gap-x-2 gap-y-2'
        : 'inline-flex items-center gap-1.5'}
      role={interactive ? 'group' : 'img'}
      aria-label={`Puntuació SoundBoxd: ${formattedValue} de ${max}`}
    >
      <div className={`flex items-center ${interactive ? 'w-full justify-between' : ''}`} aria-hidden={interactive ? 'true' : undefined}>
        {[...Array(max)].map((_, i) => {
          const ratingNumber = i + 1;
          const fillAmount = Math.min(1, Math.max(0, displayValue - (ratingNumber - 1)));

          return (
            <span
              key={i}
              className="p-0.5"
            >
              <div className="relative">
                <img
                  src="/soundbox-logo.svg"
                  alt=""
                  aria-hidden="true"
                  className={`${currentSize} rounded-sm opacity-25 grayscale`}
                />

                {fillAmount > 0 && (
                  <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fillAmount * 100}%` }}>
                    <img
                      src="/soundbox-logo.svg"
                      alt=""
                      aria-hidden="true"
                      className={`${currentSize} max-w-none rounded-sm`}
                    />
                  </div>
                )}
              </div>
            </span>
          );
        })}
      </div>

      {interactive && (
        <>
          <output className="w-10 text-right text-sm font-bold tabular-nums text-emerald-400">
            {formattedValue}
          </output>
          <input
            type="range"
            min="0"
            max={max}
            step="0.1"
            value={displayValue}
            disabled={!onChange}
            onChange={(event) => onChange?.(Number(event.target.value))}
            aria-label={`Valoració SoundBoxd: ${formattedValue} de ${max}`}
            aria-valuetext={displayValue > 0 ? `${formattedValue} de ${max}` : 'Sense valoració'}
            className="h-2 w-full min-w-0 cursor-pointer accent-emerald-400"
          />
        </>
      )}

      {showNumber && !interactive && (
        <span className="ml-1 text-sm font-semibold text-emerald-400">{formattedValue}</span>
      )}
    </div>
  );
}
