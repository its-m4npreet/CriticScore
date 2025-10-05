import React, { useState } from "react";
import MovieCard from "../components/MovieCard";
import { Icon } from "../components/Icons";

export default function TopRatedPage({ allMovies, loading, error }) {
  const [minRatings, setMinRatings] = useState(7.1); // Minimum rating threshold (default: show movies > 7)

  // Process movies for filtering and sorting - use useMemo to force re-computation when dependencies change
  const topRatedMovies = React.useMemo(() => {
    if (!allMovies || !Array.isArray(allMovies)) {
      return [];
    }

    return allMovies
      .map((movie) => {
        // Handle both backend and local data structures
        let avgRating, reviewCount;
        
        if (movie.ratings && Array.isArray(movie.ratings)) {
          // Backend data with ratings array
          if (movie.ratings.length < 1) return null;
          avgRating = movie.ratings.reduce((sum, r) => sum + r.rating, 0) / movie.ratings.length;
          reviewCount = movie.ratings.length;
        } else {
          // Local data or backend data with averageRating
          avgRating = movie.averageRating || movie.rating || 0;
          reviewCount = movie.totalRatings || 0;
        }

        // Apply rating filter based on selected threshold
        if (avgRating < minRatings) return null;

        return { 
          ...movie, 
          avgRating, 
          reviewCount,
          // Ensure we have the correct ID field
          id: movie._id || movie.movieId || movie.id
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => {
        // Sort by average rating, then by number of reviews
        if (Math.abs(a.avgRating - b.avgRating) < 0.1) {
          return b.reviewCount - a.reviewCount;
        }
        return b.avgRating - a.avgRating;
      })
      .slice(0, 50); // Top 50
  }, [allMovies, minRatings]); // Dependencies: re-compute when allMovies or minRatings change

  const bannerImg = topRatedMovies[0]?.poster || topRatedMovies[0]?.image || null;

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl border-2 border-[var(--accent-color)] relative h-40 sm:h-48 lg:h-56 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center mb-6 lg:mb-8">
        {bannerImg && (
          <img
            src={bannerImg}
            alt="Banner"
            className="object-cover w-full h-full opacity-60 absolute top-0 left-0"
          />
        )}
        <div className="relative z-10 text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 tracking-wide text-[var(--accent-color)] drop-shadow-lg">
            <Icon name="star" size={20} className="lg:w-6 lg:h-6 mr-2 text-yellow-400" />Top Rated Movies
          </h2>
          <p className="text-gray-200 text-sm sm:text-base lg:text-lg drop-shadow">
            The highest rated movies according to our community
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 lg:mb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-[var(--accent-color)] tracking-wide">
          Highest Rated ({topRatedMovies.length} movies)
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-xs lg:text-sm">Rating filter:</label>
          <select
            value={minRatings}
            onChange={(e) => setMinRatings(Number(e.target.value))}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm touch-target"
          >
            <option value={7.1}>Good (7+)</option>
            <option value={8}>Excellent (8+)</option>
            <option value={8.5}>Outstanding (8.5+)</option>
            <option value={9}>Masterpieces (9+)</option>
          </select>
        </div>
      </div>

      {/* Top Rated Movies Content Area */}
      <div className="min-h-[300px] lg:min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 lg:h-96 text-[var(--accent-color)]">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-4 border-[var(--accent-color)] mb-3 lg:mb-4"></div>
            <span className="text-lg lg:text-xl font-bold">Loading top rated movies...</span>
            <span className="text-xs lg:text-sm text-gray-400 mt-2">Finding the highest rated content</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-red-400 text-lg lg:text-xl font-bold px-4">
            {error}
          </div>
        ) : topRatedMovies.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <div className="text-4xl lg:text-6xl mb-3 lg:mb-4">
              <Icon name="star" size={48} className="lg:w-18 lg:h-18 text-yellow-400" />
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold mb-2 text-gray-300">
              No High-Rated Movies Found
            </h3>
            <p className="text-gray-400 text-sm lg:text-base px-4">
              No movies meet the current rating criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {topRatedMovies.map((movie, idx) => (
              <div key={movie.id || movie._id || movie.movieId || idx} className="relative">
                <div className="absolute -top-1 lg:-top-2 -left-1 lg:-left-2 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center font-bold text-xs lg:text-sm z-10">
                  #{idx + 1}
                </div>
                <MovieCard movie={movie} />
                <div className="mt-2 text-center">
                  <div className="flex justify-center items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                    <div className="flex items-center gap-1 text-[var(--accent-color)] font-semibold">
                      <Icon name="star" size={14} className="lg:w-4 lg:h-4 mr-1 text-yellow-400" />{movie.avgRating?.toFixed(1)}/10
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 truncate">
                      {movie.reviewCount > 0 ? `${movie.reviewCount} reviews` : 'Community rated'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
