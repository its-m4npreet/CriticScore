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
        console.log("Watchlist items type:", typeof watchlistItems, "Array?", Array.isArray(watchlistItems));

        if (Array.isArray(watchlistItems)) {
          // Extract movie IDs from watchlist items and ensure they're strings
          const movieIds = watchlistItems.map((item) => String(item.movieId));
          console.log("Movie IDs from watchlist:", movieIds);
          console.log("MovieIds after string conversion:", movieIds.map(id => `'${id}' (${typeof id})`));
          
          // Fetch full movie details for each movie ID
          const allMoviesResponse = await ApiService.getMovies();
          console.log("🌐 Full API Response:", allMoviesResponse);
          
          // Handle new API response structure with pagination
          const movies = Array.isArray(allMoviesResponse) 
            ? allMoviesResponse 
            : (allMoviesResponse?.movies || []);
          
          console.log("[Watchlist] Extracted movies array:", movies);
          console.log("All movies structure (first movie):", movies[0]);
          console.log("Movie _id type:", typeof movies[0]?._id, "Value:", movies[0]?._id);
          console.log("Looking for movie IDs:", movieIds);
          console.log("MovieIds types:", movieIds.map(id => typeof id));
          
          const watchlistMovies = movies.filter((movie) => {
            const movieId = movie._id || movie.movieId || movie.id;
            console.log("Comparing movieId:", movieId, "(type:", typeof movieId, ") with watchlist IDs:", movieIds);
            
            // Convert both to strings for comparison (handles ObjectId vs String)
            const movieIdStr = String(movieId);
            const isMatch = movieIds.includes(movieIdStr);
            
            if (isMatch) {
              console.log("[Watchlist] Found matching movie:", movie.title, "with ID:", movieId);
            } else {
              console.log("[Watchlist] No match for movie:", movie.title, "ID:", movieId);
            }
            return isMatch;
          });
          console.log("Full watchlist movies:", watchlistMovies);
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
            const allMoviesResponse = await ApiService.getMovies();
            const movies = Array.isArray(allMoviesResponse) 
              ? allMoviesResponse 
              : (allMoviesResponse?.movies || []);
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
      // Remove from local state using flexible ID matching
      setWatchlist((prev) => prev.filter((movie) => {
        const id = movie._id || movie.movieId || movie.id;
        return id !== movieId;
      }));
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      // Fallback to localStorage
      ApiService.removeFromWatchlistLocal(user.id, movieId);
      // Remove from local state using flexible ID matching
      setWatchlist((prev) => prev.filter((movie) => {
        const id = movie._id || movie.movieId || movie.id;
        return id !== movieId;
      }));
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
          <h2 className="text-3xl font-bold theme-text-primary mb-4">
            Sign In Required
          </h2>
          <p className="theme-text-secondary text-lg mb-8">
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
    <section className="px-8 py-6 theme-bg-primary">
      <div className="rounded-2xl overflow-hidden shadow-2xl border-2 theme-border-accent relative h-56 theme-bg-secondary flex items-center justify-center mb-8">
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-extrabold mb-2 tracking-wide theme-accent drop-shadow-lg">
            📚 My Watchlist
          </h2>
          <p className="theme-text-secondary text-lg drop-shadow">
            Movies you want to watch later
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold theme-text-primary tracking-wide">
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

      {/* Watchlist Content Area */}
      <div className="min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 theme-accent">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 theme-border-accent mb-4"></div>
            <span className="text-xl font-bold theme-text-primary">Loading your watchlist...</span>
            <span className="text-sm theme-text-secondary mt-2">Please wait while we fetch your movies</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-red-400 text-xl font-bold">
            {error}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📝</div>
            <h3 className="text-3xl font-semibold mb-4 theme-text-primary">
              Your Watchlist is Empty
            </h3>
            <p className="theme-text-secondary text-lg mb-8">
              Start adding movies to your watchlist by clicking the bookmark icon
              on movie cards
            </p>
            <div className="theme-bg-secondary theme-border rounded-lg p-6 max-w-md mx-auto">
              <h4 className="theme-accent font-semibold mb-2">💡 Pro Tip:</h4>
              <p className="theme-text-primary text-sm">
                Browse movies and click the 📚 icon to add them to your watchlist
                for later viewing
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {watchlist.map((movie, index) => (
              <div key={movie._id || movie.movieId || movie.id || `movie-${index}`} className="relative">
                <MovieCard movie={movie} />
                <button
                  onClick={() => removeFromWatchlist(movie._id || movie.movieId || movie.id)}
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
      </div>
    </section>
  );
}
