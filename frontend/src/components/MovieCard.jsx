import React, {  useEffect } from "react";
import StarRating from "./StarRating";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import ApiService from "../services/api";

function MovieCard({ movie }) {
  const { user, isSignedIn } = useUser();
  // const [isInWatchlist, setIsInWatchlist] = useState(false);

  const movieId = movie.movieId || movie._id;

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (isSignedIn && movieId && user) {
        try {
          console.log("Checking watchlist status for movie:", movieId);
          const result = await ApiService.checkWatchlistStatus(movieId);
          console.log("Watchlist status result:", result);
          // setIsInWatchlist(result.inWatchlist);
        } catch (error) {
          // Fallback to localStorage if backend fails
          console.warn(
            "Backend watchlist check failed, using localStorage",
            error
          );
          const watchlist = ApiService.getWatchlistLocal(user.id);
          console.log("Local watchlist for status check:", watchlist);
          // setIsInWatchlist(watchlist.includes(movieId));
        }
      }
    };

    checkWatchlistStatus();
  }, [isSignedIn, user, movieId]);



  return (
    <div className="bg-[#232323] rounded-xl shadow-2xl overflow-hidden hover:border-[#f5c518] border-2 border-transparent transition-all duration-200 relative group h-[360px] w-[240px] flex flex-col flex-shrink-0">
      <Link to={`/movie/${movieId}`} className="flex-shrink-0">
        <img
          src={movie.image || movie.poster}
          alt={movie.name || movie.title}
          className="w-full h-40 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/240x160/232323/f5c518?text=No+Image';
          }}
        />
      </Link>

      {/* Watchlist button */}
      {/* <button
        onClick={toggleWatchlist}
        disabled={isLoading}
        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${
          isInWatchlist
            ? "bg-[#f5c518] text-black hover:bg-yellow-400"
            : "bg-black/50 text-white hover:bg-black/70"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        )}
      </button> */}

      <div className="p-4 flex flex-col flex-grow">
        {/* Title with fixed height and overflow handling */}
        <h4 className="text-lg font-extrabold mb-2 text-[#f5c518] drop-shadow line-clamp-2 h-14 flex items-start">
          <span className="overflow-hidden">
            {movie.name || movie.title}
          </span>
        </h4>
        
        {/* Description with fixed height */}
        <p className="text-gray-300 text-sm mb-3 line-clamp-3 h-16 overflow-hidden">
          {movie.desc || movie.description}
        </p>
        
        {/* Spacer to push bottom content down */}
        <div className="flex-grow"></div>
        
        {/* Bottom section with consistent positioning */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold bg-[#f5c518] text-black px-2 py-1 rounded shadow whitespace-nowrap">
              {movie.year ||
                (movie.releaseDate
                  ? new Date(movie.releaseDate).getFullYear()
                  : "N/A")}
            </span>
            <div className="flex-shrink-0">
              <StarRating rating={movie.rating || movie.averageRating || 0} />
            </div>
          </div>

          {/* Show rating count if available */}
          {movie.ratings && movie.ratings.length > 0 && (
            <div className="text-xs text-gray-400 text-center">
              {movie.ratings.length} rating{movie.ratings.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default MovieCard;
