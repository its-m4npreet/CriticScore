import React, { useState, useEffect } from "react";
import StarRating from "./StarRating";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import ApiService from "../services/api";

function MovieCard({ movie }) {
  const { user, isSignedIn } = useUser();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const movieId = movie.movieId || movie._id;

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (isSignedIn && movieId && user) {
        try {
          console.log("Checking watchlist status for movie:", movieId);
          const result = await ApiService.checkWatchlistStatus(movieId);
          console.log("Watchlist status result:", result);
          setIsInWatchlist(result.inWatchlist);
        } catch (error) {
          // Fallback to localStorage if backend fails
          console.warn(
            "Backend watchlist check failed, using localStorage",
            error
          );
          const watchlist = ApiService.getWatchlistLocal(user.id);
          console.log("Local watchlist for status check:", watchlist);
          setIsInWatchlist(watchlist.includes(movieId));
        }
      }
    };

    checkWatchlistStatus();
  }, [isSignedIn, user, movieId]);

  const toggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      alert("Please sign in to add movies to your watchlist");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isInWatchlist) {
        await ApiService.removeFromWatchlist(movieId);
        setIsInWatchlist(false);
      } else {
        console.log("Adding movie to watchlist:", movieId);
        const result = await ApiService.addToWatchlist(movieId);
        console.log("Add watchlist result:", result);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Watchlist operation failed:", error);
      // Fallback to localStorage
      if (isInWatchlist) {
        ApiService.removeFromWatchlistLocal(user.id, movieId);
        setIsInWatchlist(false);
      } else {
        ApiService.addToWatchlistLocal(user.id, movieId);
        setIsInWatchlist(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#232323] rounded-xl shadow-2xl overflow-hidden hover:border-[#f5c518] border-2 border-transparent transition-all duration-200 relative group">
      <Link to={`/movie/${movieId}`}>
        <img
          src={movie.image || movie.poster}
          alt={movie.name || movie.title}
          className="w-full h-48 object-cover"
        />
      </Link>

      {/* Watchlist Button */}
      <button
        onClick={toggleWatchlist}
        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${
          isInWatchlist
            ? "bg-[#f5c518] text-black hover:bg-yellow-400"
            : "bg-black/70 text-white hover:bg-black/90"
        }`}
        title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {isInWatchlist ? "📚" : "📖"}
      </button>

      <div className="p-4">
        <h4 className="text-lg font-extrabold mb-1 text-[#f5c518] drop-shadow">
          {movie.name || movie.title}
        </h4>
        <p className="text-gray-300 text-sm mb-2 line-clamp-2">
          {movie.desc || movie.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-bold bg-[#f5c518] text-black px-2 py-0.5 rounded shadow">
            {movie.year ||
              (movie.releaseDate
                ? new Date(movie.releaseDate).getFullYear()
                : "N/A")}
          </span>
          <StarRating rating={movie.rating || movie.averageRating || 0} />
        </div>

        {/* Show rating count if available */}
        {movie.ratings && movie.ratings.length > 0 && (
          <div className="text-xs text-gray-400 mt-1 text-center">
            {movie.ratings.length} rating{movie.ratings.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
export default MovieCard;
