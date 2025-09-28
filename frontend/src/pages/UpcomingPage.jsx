import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import ApiService from "../services/api";

export default function UpcomingPage() {
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getMovies();
        const allMovies = Array.isArray(response) ? response : [];

        // For demo purposes, we'll show movies that don't have many ratings yet as "upcoming"
        // In a real app, you'd have a release date field
        const upcoming = allMovies
          .filter((movie) => {
            // Consider movies with fewer than 5 ratings as "upcoming"
            const ratingCount = movie.ratings ? movie.ratings.length : 0;
            return ratingCount < 5;
          })
          .sort((a, b) => {
            // Sort by rating count (fewer ratings first, as they're "newer")
            const aRatings = a.ratings ? a.ratings.length : 0;
            const bRatings = b.ratings ? b.ratings.length : 0;
            return aRatings - bRatings;
          });

        setUpcomingMovies(upcoming);
      } catch (err) {
        setError("Failed to load upcoming movies");
        console.error("Error fetching upcoming movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, []);

  const notifyWhenAvailable = (movieId, movieTitle) => {
    // Simple notification system using localStorage
    const notifications = JSON.parse(
      localStorage.getItem("movie_notifications") || "[]"
    );
    if (!notifications.includes(movieId)) {
      notifications.push(movieId);
      localStorage.setItem(
        "movie_notifications",
        JSON.stringify(notifications)
      );
      alert(`✅ You'll be notified when "${movieTitle}" becomes available!`);
    } else {
      alert(
        `🔔 You're already subscribed to notifications for "${movieTitle}"`
      );
    }
  };

  return (
    <section className="px-8 py-6">
      <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[#f5c518] relative h-56 bg-gradient-to-r from-[#232323] to-[#141414] flex items-center justify-center mb-8">
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-extrabold mb-2 tracking-wide text-[#f5c518] drop-shadow-lg">
            🗓️ Coming Soon
          </h2>
          <p className="text-gray-200 text-lg drop-shadow">
            Get ready for the next wave of amazing movies
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-400/30 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🎬</span>
          <h3 className="text-xl font-bold text-blue-300">
            New Releases & Hidden Gems
          </h3>
        </div>
        <p className="text-gray-300">
          Discover movies that are just starting to get attention from our
          community. Be among the first to rate and review!
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white tracking-wide">
          Upcoming & New Releases ({upcomingMovies.length})
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center w-full h-32 text-[#f5c518] text-xl font-bold">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5c518]"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full h-32 text-red-400 text-xl font-bold">
          {error}
        </div>
      ) : upcomingMovies.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-6">🎭</div>
          <h3 className="text-3xl font-semibold mb-4 text-gray-300">
            All Caught Up!
          </h3>
          <p className="text-gray-400 text-lg mb-8">
            All movies in our database have been discovered by the community
          </p>
          <div className="bg-[#232323] border border-gray-600 rounded-lg p-6 max-w-md mx-auto">
            <h4 className="text-[#f5c518] font-semibold mb-2">
              🔍 Keep Exploring:
            </h4>
            <p className="text-gray-300 text-sm">
              Check out our trending and top-rated sections for more great
              movies to watch
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {upcomingMovies.map((movie) => {
            const ratingCount = movie.ratings ? movie.ratings.length : 0;
            return (
              <div key={movie._id} className="relative">
                {ratingCount === 0 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-bold z-10">
                    NEW
                  </div>
                )}
                <MovieCard movie={movie} />
                <div className="mt-3 space-y-2">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">
                      {ratingCount === 0
                        ? "⭐ No ratings yet"
                        : `⭐ ${ratingCount} rating${
                            ratingCount !== 1 ? "s" : ""
                          }`}
                    </div>
                  </div>
                  <button
                    onClick={() => notifyWhenAvailable(movie._id, movie.title)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm py-2 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    🔔 Notify Me
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
