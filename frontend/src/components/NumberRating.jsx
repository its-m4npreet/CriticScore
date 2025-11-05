import React, { useState } from "react";

export default function NumberRating({
  rating = 0,
  onRatingChange = null,
  interactive = false,
  showLabel = true,
}) {
  const [hover, setHover] = useState(0);

  const handleNumberClick = (newRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleNumberHover = (newRating) => {
    if (interactive) {
      setHover(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHover(0);
    }
  };

  const displayRating = hover || rating;

  return (
    <div className="flex flex-col items-center gap-2 lg:gap-3">
      {showLabel && (
        <label className="text-xs lg:text-sm font-medium text-gray-300">
          Rate this movie (1-10)
        </label>
      )}

      <div className="flex flex-wrap justify-center gap-1.5 lg:gap-2 max-w-full" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => interactive && handleNumberClick(number)}
            onMouseEnter={() => interactive && handleNumberHover(number)}
            disabled={!interactive}
            className={`
              w-8 h-8 lg:w-10 lg:h-10 rounded-lg font-bold text-xs lg:text-sm transition-all duration-200 flex-shrink-0
              ${
                interactive
                  ? "cursor-pointer active:scale-95 lg:hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#f5c518]"
                  : "cursor-default"
              }
              ${
                number <= displayRating
                  ? "bg-[#f5c518] text-black shadow-lg"
                  : "bg-gray-700 text-gray-300 active:bg-gray-600 lg:hover:bg-gray-600"
              }
              ${interactive && hover >= number ? "transform lg:scale-105" : ""}
            `}
            title={interactive ? `Rate ${number} out of 10` : undefined}
          >
            {number}
          </button>
        ))}
      </div>

      {displayRating > 0 && (
        <div className="text-center">
          <span className="text-xl lg:text-2xl font-bold text-[#f5c518]">
            {displayRating}/10
          </span>
          {interactive && (
            <p className="text-xs text-gray-400 mt-1">
              {window.innerWidth < 1024 ? "Tap to rate" : "Click to rate • Hover to preview"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
