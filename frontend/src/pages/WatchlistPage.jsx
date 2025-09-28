import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import ApiService from "../services/api";
import { useUser } from "@clerk/clerk-react";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use backend API for watchlist
        console.log("Fetching watchlist from backend...");
        const watchlistItems = await ApiService.getWatchlist();
        console.log("Watchlist items received:", watchlistItems);

        if (Array.isArray(watchlistItems)) {
          const watchlistMovies = watchlistItems.map((item) => item.movieId);
          console.log("Processed watchlist movies:", watchlistMovies);
          setWatchlist(watchlistMovies);
        } else {
          console.error("Unexpected watchlist format:", watchlistItems);
          setWatchlist([]);
        }
      } catch (err) {
        setError("Failed to load watchlist from backend");
        console.error("Error fetching watchlist:", err);

        // Fallback to localStorage
        try {
          console.log("Falling back to localStorage...");
          const localWatchlist = ApiService.getWatchlistLocal(user.id);
          console.log("Local watchlist:", localWatchlist);

          if (localWatchlist.length > 0) {
            const allMovies = await ApiService.getMovies();
            const movies = Array.isArray(allMovies) ? allMovies : [];
            const watchlistMovies = movies.filter((movie) =>
              localWatchlist.includes(movie._id || movie.movieId)
            );
            console.log("Local watchlist movies:", watchlistMovies);
            setWatchlist(watchlistMovies);
            setError(null); // Clear error since we found local data
          }
        } catch (localErr) {
          console.error("Local fallback also failed:", localErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [isSignedIn, user]);

  const removeFromWatchlist = async (movieId) => {
    if (!isSignedIn) return;

    try {
      await ApiService.removeFromWatchlist(movieId);
      setWatchlist((prev) => prev.filter((movie) => movie._id !== movieId));
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      // Fallback to localStorage
      ApiService.removeFromWatchlistLocal(user.id, movieId);
      setWatchlist((prev) => prev.filter((movie) => movie._id !== movieId));
    }
  };

  const clearWatchlistFn = async () => {
    if (!isSignedIn) return;

    try {
      await ApiService.clearWatchlist();
      setWatchlist([]);
    } catch (error) {
      console.error("Failed to clear watchlist:", error);
      // Fallback to localStorage
      ApiService.clearWatchlistLocal(user.id);
      setWatchlist([]);
    }
  };

  if (!isSignedIn) {
    return (
      <section className="px-8 py-6">
        <div className="text-center py-20">
          <div className="text-8xl mb-6">🔐</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            You need to sign in to view and manage your watchlist
          </p>
          <button className="bg-[#f5c518] text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
            Sign In
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-8 py-6">
      <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[#f5c518] relative h-56 bg-gradient-to-r from-[#232323] to-[#141414] flex items-center justify-center mb-8">
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-extrabold mb-2 tracking-wide text-[#f5c518] drop-shadow-lg">
            📚 My Watchlist
          </h2>
          <p className="text-gray-200 text-lg drop-shadow">
            Movies you want to watch later
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white tracking-wide">
          Your Watchlist ({watchlist.length} movies)
        </h3>
        {watchlist.length > 0 && (
          <button
            onClick={clearWatchlistFn}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center w-full h-32 text-[#f5c518] text-xl font-bold">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5c518]"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full h-32 text-red-400 text-xl font-bold">
          {error}
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-6">📝</div>
          <h3 className="text-3xl font-semibold mb-4 text-gray-300">
            Your Watchlist is Empty
          </h3>
          <p className="text-gray-400 text-lg mb-8">
            Start adding movies to your watchlist by clicking the bookmark icon
            on movie cards
          </p>
          <div className="bg-[#232323] border border-gray-600 rounded-lg p-6 max-w-md mx-auto">
            <h4 className="text-[#f5c518] font-semibold mb-2">💡 Pro Tip:</h4>
            <p className="text-gray-300 text-sm">
              Browse movies and click the 📚 icon to add them to your watchlist
              for later viewing
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {watchlist.map((movie) => (
            <div key={movie._id} className="relative">
              <MovieCard movie={movie} />
              <button
                onClick={() => removeFromWatchlist(movie._id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors z-10"
                title="Remove from watchlist"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
