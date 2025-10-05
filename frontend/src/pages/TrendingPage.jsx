import React from "react";
import MovieCard from "../components/MovieCard";
import { Icon } from "../components/Icons";

export default function TrendingPage({ allMovies, loading, error }) {
  // Filter and process only trending movies
  let trendingMovies = [];
  if (allMovies && Array.isArray(allMovies)) {
    trendingMovies = allMovies
      .filter((movie) => {
        // Check both local data (trending) and backend data (featured) fields
        return movie.trending === true || movie.featured === true;
      })
      .map((movie) => {
        // Handle data structure
        const avgRating = movie.averageRating || movie.rating || 0;
        const reviewCount = movie.totalRatings || 0;

        return { 
          ...movie, 
          avgRating, 
          reviewCount,
          // Ensure we have the correct ID field
          id: movie._id || movie.movieId || movie.id
        };
      })
      .sort((a, b) => b.avgRating - a.avgRating); // Sort by rating
  }

  const bannerImg = trendingMovies[0]?.poster || trendingMovies[0]?.image || null;

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
            🔥 What's Hot Right Now
          </h2>
          <p className="text-gray-200 text-sm sm:text-base lg:text-lg drop-shadow">
            Discover the most popular and highest-rated movies right now
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-[var(--accent-color)] tracking-wide">
          Trending Now ({trendingMovies.length} movies)
        </h3>
      </div>

      {/* Trending Movies Content Area */}
      <div className="min-h-[300px] lg:min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 lg:h-96 text-[var(--accent-color)]">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-4 border-[var(--accent-color)] mb-3 lg:mb-4"></div>
            <span className="text-lg lg:text-xl font-bold">Loading trending movies...</span>
            <span className="text-xs lg:text-sm text-gray-400 mt-2">Finding what's hot right now</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-red-400 text-lg lg:text-xl font-bold px-4">
            {error}
          </div>
        ) : trendingMovies.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <div className="text-4xl lg:text-6xl mb-3 lg:mb-4">
              🔥
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold mb-2 text-gray-300">
              No Trending Movies Found
            </h3>
            <p className="text-gray-400 text-sm lg:text-base px-4">
              Check back later for trending content
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {trendingMovies.map((movie, idx) => (
              <div key={movie.id || movie._id || movie.movieId || idx} className="relative">
                <div className="absolute -top-1 lg:-top-2 -left-1 lg:-left-2 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center font-bold text-xs lg:text-sm z-10">
                  #{idx + 1}
                </div>
                <MovieCard movie={movie} />
                <div className="mt-2 text-center">
                  <div className="flex justify-center items-center gap-1 lg:gap-2 text-xs lg:text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Icon name="star" size={14} className="lg:w-4 lg:h-4 mr-1 text-yellow-400" />{movie.avgRating?.toFixed(1)}
                    </span>
                    <span>•</span>
                    <span className="truncate">
                      {movie.reviewCount > 0 ? `${movie.reviewCount} reviews` : 'Trending'}
                      {movie.trending && ' 🔥'}
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
