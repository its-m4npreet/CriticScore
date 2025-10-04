import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import ApiService from "../services/api";
import { Icon } from "../components/Icons";

export default function TopRatedPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minRatings, setMinRatings] = useState(3); // Minimum number of ratings to qualify

  useEffect(() => {
    const fetchTopRatedMovies = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getMovies();
        const allMovies = Array.isArray(response) ? response : [];

        // Calculate average ratings and filter by minimum rating count
        const topRatedMovies = allMovies
          .filter(
            (movie) => movie.ratings && movie.ratings.length >= minRatings
          )
          .map((movie) => {
            const avgRating =
              movie.ratings.reduce((sum, r) => sum + r.rating, 0) /
              movie.ratings.length;
            const reviewCount = movie.ratings.length;
            return { ...movie, avgRating, reviewCount };
          })
          .sort((a, b) => {
            // Sort by average rating, then by number of reviews
            if (Math.abs(a.avgRating - b.avgRating) < 0.1) {
              return b.reviewCount - a.reviewCount;
            }
            return b.avgRating - a.avgRating;
          })
          .slice(0, 50); // Top 50

        setMovies(topRatedMovies);
      } catch (err) {
        setError("Failed to load top rated movies");
        console.error("Error fetching top rated movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRatedMovies();
  }, [minRatings]);

  const bannerImg = movies[0]?.image || movies[0]?.poster || null;

  return (
    <section className="px-8 py-6">
      <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[var(--accent-color)] relative h-56 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center mb-8">
        {bannerImg && (
          <img
            src={bannerImg}
            alt="Banner"
            className="object-cover w-full h-full opacity-60 absolute top-0 left-0"
          />
        )}
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-extrabold mb-2 tracking-wide text-[var(--accent-color)] drop-shadow-lg">
            <Icon name="star" size={24} className="mr-2 text-yellow-400" />Top Rated Movies
          </h2>
          <p className="text-gray-200 text-lg drop-shadow">
            The highest rated movies according to our community
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[var(--accent-color)] tracking-wide">
          Highest Rated ({movies.length} movies)
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Min. ratings:</label>
          <select
            value={minRatings}
            onChange={(e) => setMinRatings(Number(e.target.value))}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-1 rounded-md text-sm"
          >
            <option value={1}>1+</option>
            <option value={3}>3+</option>
            <option value={5}>5+</option>
            <option value={10}>10+</option>
          </select>
        </div>
      </div>

      {/* Top Rated Movies Content Area */}
      <div className="min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-[var(--accent-color)]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--accent-color)] mb-4"></div>
            <span className="text-xl font-bold">Loading top rated movies...</span>
            <span className="text-sm text-gray-400 mt-2">Finding the highest rated content</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-red-400 text-xl font-bold">
            {error}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              <Icon name="star" size={72} className="text-yellow-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-300">
              No Qualified Movies Yet
            </h3>
            <p className="text-gray-400">
              Movies need at least {minRatings} ratings to appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
            {movies.map((movie, idx) => (
              <div key={movie._id} className="relative">
                <div className="absolute -top-2 -left-2 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm z-10">
                  #{idx + 1}
                </div>
                <MovieCard movie={movie} />
                <div className="mt-2 text-center">
                  <div className="flex justify-center items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-[var(--accent-color)] font-semibold">
                      <Icon name="star" size={16} className="mr-1 text-yellow-400" />{movie.avgRating?.toFixed(1)}/10
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">
                      {movie.reviewCount} reviews
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
