import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import ApiService from "../services/api";
import { Icon } from "../components/Icons";

export default function TrendingPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getMovies();
        const allMovies = Array.isArray(response) ? response : [];

        // Calculate trending score based on rating and recent activity
        const trendingMovies = allMovies
          .filter((movie) => movie.ratings && movie.ratings.length > 0)
          .map((movie) => {
            const avgRating =
              movie.ratings.reduce((sum, r) => sum + r.rating, 0) /
              movie.ratings.length;
            const reviewCount = movie.ratings.length;
            const trendingScore = avgRating * reviewCount + reviewCount * 0.5;
            return { ...movie, avgRating, reviewCount, trendingScore };
          })
          .sort((a, b) => b.trendingScore - a.trendingScore)
          .slice(0, 20);

        setMovies(trendingMovies);
      } catch (err) {
        setError("Failed to load trending movies");
        console.error("Error fetching trending movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingMovies();
  }, []);

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
            🔥 What's Hot Right Now
          </h2>
          <p className="text-gray-200 text-lg drop-shadow">
            Discover the most popular and highest-rated movies right now
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[var(--accent-color)] tracking-wide">
          Trending Now
        </h3>
      </div>

      {/* Trending Movies Content Area */}
      <div className="min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-[var(--accent-color)]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--accent-color)] mb-4"></div>
            <span className="text-xl font-bold">Loading trending movies...</span>
            <span className="text-sm text-gray-400 mt-2">Finding what's hot right now</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-red-400 text-xl font-bold">
            {error}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              <Icon name="trending" size={72} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-300">
              No Trending Movies Yet
            </h3>
            <p className="text-gray-400">
              Movies will appear here as users start rating them
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
                  <div className="flex justify-center items-center gap-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Icon name="star" size={16} className="mr-1 text-yellow-400" />{movie.avgRating?.toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>{movie.reviewCount} reviews</span>
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
