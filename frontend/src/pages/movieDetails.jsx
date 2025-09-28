import { useAuth } from "@clerk/clerk-react";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBookmark,
  FaHeart,
  FaShare,
  FaStar,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import ReviewSection from "../components/ReviewSection";
import apiService from "../services/api";

export default function MovieDetailPage({ allMovies }) {
  const { id } = useParams();
  const { getToken } = useAuth();

  // Use backend data if available, fallback to prop data
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState("");

  // Local state for watchlist and favorites (these could also be moved to backend)
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Set up auth token for API service
  useEffect(() => {
    if (getToken) {
      window.__clerk_token_getter = getToken;
      //   console.log("Auth token getter set" + isSignedIn);
    }
  }, [getToken]);

  const loadMovieData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to get movie from backend first
      const movieData = await apiService.getMovieById(id);

      if (movieData && (movieData._id || movieData.id)) {
        setMovie(movieData);

        // Load user preferences from localStorage (temporary until backend integration)
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        const liked = JSON.parse(localStorage.getItem("likedMovies") || "[]");

        setIsWatchlisted(watchlist.includes(id));
        setIsLiked(liked.includes(id));
      } else {
        throw new Error("No valid movie data received from backend");
      }
    } catch (err) {
      console.error("Failed to load movie from backend:", err);

      // Fallback to prop data if backend fails
      const fallbackMovie = allMovies?.find((m) => m.movieId === id);
      if (fallbackMovie) {
        setMovie({
          _id: id,
          title: fallbackMovie.name,
          description: fallbackMovie.desc,
          poster: fallbackMovie.image,
          releaseDate: new Date(fallbackMovie.year, 0, 1),
          averageRating: fallbackMovie.rating || 0,
          totalRatings: 0,
          genre: [fallbackMovie.category],
          // Add other required fields with defaults
          director: "Unknown",
          cast: [],
          duration: 120,
          language: "English",
          country: "USA",
          isActive: true,
        });

        // Load user preferences from localStorage for fallback
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        const liked = JSON.parse(localStorage.getItem("likedMovies") || "[]");

        setIsWatchlisted(watchlist.includes(id));
        setIsLiked(liked.includes(id));
      } else {
        setError("Movie not found");
      }
    } finally {
      setLoading(false);
    }
  }, [id, allMovies]);

  // Load movie data
  useEffect(() => {
    loadMovieData();
  }, [loadMovieData]);

  // Show notification helper
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Handle watchlist toggle
  const handleWatchlistToggle = () => {
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    let updatedWatchlist;

    if (isWatchlisted) {
      updatedWatchlist = watchlist.filter((movieId) => movieId !== id);
      setIsWatchlisted(false);
      showNotification("Removed from watchlist");
    } else {
      updatedWatchlist = [...watchlist, id];
      setIsWatchlisted(true);
      showNotification("Added to watchlist");
    }

    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
  };

  // Handle like toggle
  const handleLikeToggle = () => {
    const liked = JSON.parse(localStorage.getItem("likedMovies") || "[]");
    let updatedLiked;

    if (isLiked) {
      updatedLiked = liked.filter((movieId) => movieId !== id);
      setIsLiked(false);
      showNotification("Removed from favorites");
    } else {
      updatedLiked = [...liked, id];
      setIsLiked(true);
      showNotification("Added to favorites");
    }

    localStorage.setItem("likedMovies", JSON.stringify(updatedLiked));
  };

  // Handle share functionality
  const handleShare = async () => {
    const url = window.location.href;
    const title = `${movie.title} - CriticScore`;
    const text = `${movie.description}\n\nRated ${movie.averageRating}/10 ⭐`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        showNotification("Shared successfully!");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          showNotification("Sharing cancelled or failed");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showNotification("Link copied to clipboard!");
      } catch (clipboardError) {
        showNotification("Sharing not supported on this browser");
        console.error("Clipboard fallback failed:", clipboardError);
      }
    }
  };

  // Handle review updates from ReviewSection
  const handleReviewUpdate = (updatedRating) => {
    if (updatedRating) {
      showNotification(
        `Review ${updatedRating.rating ? "updated" : "submitted"} successfully!`
      );
    } else {
      showNotification("Review deleted successfully!");
    }

    // Optionally refresh movie data to get updated averages
    loadMovieData();
  };

  if (loading) {
    return (
      <section className="px-8 py-6">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5c518]"></div>
        </div>
      </section>
    );
  }

  if (error || !movie) {
    return (
      <section className="px-8 py-6">
        <div className="text-center text-red-400 text-xl">
          {error || "Movie not found"}
        </div>
      </section>
    );
  }

  return (
    <section className="px-8 py-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-[#f5c518] text-black px-6 py-3 rounded-lg shadow-lg z-50 font-semibold">
          {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#f5c518] hover:text-[#e5b91f] transition-colors"
          >
            <FaArrowLeft /> Back to Movies
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center px-12">
            <div className="flex gap-8 items-center max-w-4xl">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-48 h-72 object-cover rounded-xl shadow-2xl border-2 border-[#f5c518]"
              />
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-[#f5c518] mb-4 drop-shadow-lg">
                  {movie.title}
                </h1>
                <p className="text-gray-200 text-lg mb-6 leading-relaxed max-w-2xl">
                  {movie.description}
                </p>

                {/* Movie Info */}
                <div className="flex items-center gap-6 mb-6">
                  <span className="text-lg font-bold bg-[#f5c518] text-black px-3 py-1 rounded">
                    {new Date(movie.releaseDate).getFullYear()}
                  </span>
                  <div className="flex items-center gap-2">
                    <FaStar className="text-[#f5c518]" />
                    <span className="text-white text-lg font-semibold">
                      {movie.averageRating
                        ? movie.averageRating.toFixed(1)
                        : "N/A"}
                      /10
                    </span>
                    <span className="text-gray-400 text-sm">
                      ({movie.totalRatings || 0}{" "}
                      {movie.totalRatings === 1 ? "rating" : "ratings"})
                    </span>
                  </div>
                  <span className="bg-[#232323] text-[#f5c518] px-3 py-1 rounded border border-[#f5c518]">
                    {movie.genre?.[0] || "Drama"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleWatchlistToggle}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      isWatchlisted
                        ? "bg-[#f5c518] text-black"
                        : "bg-[#232323] text-[#f5c518] border border-[#f5c518] hover:bg-[#f5c518] hover:text-black"
                    }`}
                  >
                    <FaBookmark />{" "}
                    {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
                  </button>
                  <button
                    onClick={handleLikeToggle}
                    className={`p-3 rounded-lg transition-colors ${
                      isLiked
                        ? "bg-red-600 text-white"
                        : "bg-[#232323] text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <FaHeart />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-[#232323] text-gray-400 rounded-lg hover:text-[#f5c518] transition-colors"
                    title="Share this movie"
                  >
                    <FaShare />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Movie Overview */}
            <div className="bg-[#232323] rounded-xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-1 bg-[#f5c518] h-6 inline-block rounded-full"></span>
                <h2 className="text-2xl font-bold text-white">Overview</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Synopsis
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {movie.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-[#f5c518] mb-2">
                      Details
                    </h4>
                    <div className="space-y-2 text-gray-300">
                      <p>
                        <span className="text-white font-medium">
                          Release Year:
                        </span>{" "}
                        {new Date(movie.releaseDate).getFullYear()}
                      </p>
                      <p>
                        <span className="text-white font-medium">Genre:</span>{" "}
                        {movie.genre?.join(", ") || "N/A"}
                      </p>
                      <p>
                        <span className="text-white font-medium">
                          Duration:
                        </span>{" "}
                        {movie.duration ? `${movie.duration} min` : "N/A"}
                      </p>
                      <p>
                        <span className="text-white font-medium">
                          Language:
                        </span>{" "}
                        {movie.language || "N/A"}
                      </p>
                      <p>
                        <span className="text-white font-medium">Country:</span>{" "}
                        {movie.country || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-[#f5c518] mb-2">
                      Cast & Crew
                    </h4>
                    <div className="space-y-2 text-gray-300">
                      <p>
                        <span className="text-white font-medium">
                          Director:
                        </span>{" "}
                        {movie.director || "N/A"}
                      </p>
                      <p>
                        <span className="text-white font-medium">Cast:</span>{" "}
                        {movie.cast?.join(", ") || "N/A"}
                      </p>
                      {movie.budget && (
                        <p>
                          <span className="text-white font-medium">
                            Budget:
                          </span>{" "}
                          ${(movie.budget / 1000000).toFixed(1)}M
                        </p>
                      )}
                      {movie.boxOffice && (
                        <p>
                          <span className="text-white font-medium">
                            Box Office:
                          </span>{" "}
                          ${(movie.boxOffice / 1000000).toFixed(1)}M
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection
              movieId={movie._id || movie.movieId || id}
              onReviewUpdate={handleReviewUpdate}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-[#232323] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#f5c518] mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">CriticScore Rating</span>
                  <span className="text-white font-semibold">
                    {movie.averageRating
                      ? movie.averageRating.toFixed(1)
                      : "N/A"}
                    /10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Ratings</span>
                  <span className="text-white font-semibold">
                    {movie.totalRatings || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Release Date</span>
                  <span className="text-white font-semibold">
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status</span>
                  <span className="text-white font-semibold">
                    {movie.isActive ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>

            {/* Movie Poster */}
            <div className="bg-[#232323] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#f5c518] mb-4">Poster</h3>
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
