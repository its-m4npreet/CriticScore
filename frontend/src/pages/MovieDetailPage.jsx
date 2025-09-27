import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { FaStar, FaPlay, FaBookmark, FaShare, FaHeart, FaArrowLeft } from "react-icons/fa";
import StarRating from "../components/StarRating";

export default function MovieDetailPage({ allMovies }) {
  const { id } = useParams();
  const movie = allMovies.find((m) => m.movieId === id);
  
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [newReview, setNewReview] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [notification, setNotification] = useState("");
  const [userHasRated, setUserHasRated] = useState(false);
  const [movieRating, setMovieRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  // Initialize reviews and user preferences
  useEffect(() => {
    if (movie) {
      // Load initial reviews (mock data)
      setReviews([
        {
          id: 1,
          user: "MovieBuff123",
          rating: 9,
          comment: "Absolutely incredible! The character development is phenomenal and the plot twists kept me on the edge of my seat.",
          date: new Date().toISOString().split('T')[0],
          helpful: 24
        },
        {
          id: 2,
          user: "CinemaLover",
          rating: 8,
          comment: "Great storyline and amazing visuals. Definitely worth watching multiple times to catch all the details.",
          date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
          helpful: 18
        },
        {
          id: 3,
          user: "ReviewExpert",
          rating: 7,
          comment: "Good movie overall, though some parts felt a bit rushed. The ending was satisfying though!",
          date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
          helpful: 12
        }
      ]);

      // Load user preferences from localStorage
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      const liked = JSON.parse(localStorage.getItem('likedMovies') || '[]');
      const savedRating = localStorage.getItem(`rating_${movie.movieId}`);
      
      // Load movie ratings data
      const movieRatingsData = JSON.parse(localStorage.getItem(`movieRatings_${movie.movieId}`) || '{"ratings": [], "totalRating": 0, "averageRating": 0}');
      
      setIsWatchlisted(watchlist.includes(movie.movieId));
      setIsLiked(liked.includes(movie.movieId));
      setMovieRating(movieRatingsData.averageRating || movie.rating);
      setTotalRatings(movieRatingsData.ratings.length);
      
      if (savedRating) {
        setUserRating(parseInt(savedRating));
        setUserHasRated(true);
      }
    }
  }, [movie]);

  // Show notification helper
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Handle watchlist toggle
  const handleWatchlistToggle = () => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    let updatedWatchlist;
    
    if (isWatchlisted) {
      updatedWatchlist = watchlist.filter(id => id !== movie.movieId);
      setIsWatchlisted(false);
      showNotification("Removed from watchlist");
    } else {
      updatedWatchlist = [...watchlist, movie.movieId];
      setIsWatchlisted(true);
      showNotification("Added to watchlist");
    }
    
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
  };

  // Handle like toggle
  const handleLikeToggle = () => {
    const liked = JSON.parse(localStorage.getItem('likedMovies') || '[]');
    let updatedLiked;
    
    if (isLiked) {
      updatedLiked = liked.filter(id => id !== movie.movieId);
      setIsLiked(false);
      showNotification("Removed from favorites");
    } else {
      updatedLiked = [...liked, movie.movieId];
      setIsLiked(true);
      showNotification("Added to favorites");
    }
    
    localStorage.setItem('likedMovies', JSON.stringify(updatedLiked));
  };

  // Handle share functionality - Native Web Share API only
  const handleShare = async () => {
    const url = window.location.href;
    const title = `${movie.name} - CriticScore`;
    const text = `${movie.desc}\n\nRated ${movie.rating}/10 ⭐`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        showNotification("Shared successfully!");
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          showNotification("Sharing cancelled or failed");
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(url);
        showNotification("Link copied to clipboard! (Web Share not supported)");
      } catch (clipboardError) {
        showNotification("Sharing not supported on this browser");
        console.error('Clipboard fallback failed:', clipboardError);
      }
    }
  };

  // Handle rating submission
  const handleRatingSubmit = () => {
    if (userRating > 0) {
      console.log("Submitting rating:", userRating, "for movie:", movie.movieId);
      
      // Save user's individual rating
      localStorage.setItem(`rating_${movie.movieId}`, userRating.toString());
      
      // Load existing movie ratings data
      const movieRatingsData = JSON.parse(localStorage.getItem(`movieRatings_${movie.movieId}`) || '{"ratings": [], "totalRating": 0, "averageRating": 0}');
      
      // Add the new rating or update existing one
      const existingRatingIndex = movieRatingsData.ratings.findIndex(r => r.userId === 'currentUser'); // In real app, use actual user ID
      
      if (existingRatingIndex >= 0) {
        // Update existing rating
        const oldRating = movieRatingsData.ratings[existingRatingIndex].rating;
        movieRatingsData.ratings[existingRatingIndex].rating = userRating;
        movieRatingsData.totalRating = movieRatingsData.totalRating - oldRating + userRating;
        showNotification(`✅ Updated your rating to ${userRating}/10`);
      } else {
        // Add new rating
        movieRatingsData.ratings.push({
          userId: 'currentUser', // In real app, use actual user ID
          rating: userRating,
          date: new Date().toISOString()
        });
        movieRatingsData.totalRating += userRating;
        showNotification(`🌟 You rated ${movie.name}: ${userRating}/10`);
      }
      
      // Calculate new average
      const newAverage = movieRatingsData.ratings.length > 0 
        ? (movieRatingsData.totalRating / movieRatingsData.ratings.length).toFixed(1)
        : movie.rating;
      
      movieRatingsData.averageRating = parseFloat(newAverage);
      
      // Save updated ratings data
      localStorage.setItem(`movieRatings_${movie.movieId}`, JSON.stringify(movieRatingsData));
      
      // Update state
      setMovieRating(parseFloat(newAverage));
      setTotalRatings(movieRatingsData.ratings.length);
      setUserHasRated(true);
      
      console.log(`Rating submitted successfully: ${movie.name} - ${userRating}/10, New average: ${newAverage}`);
    } else {
      console.log("No rating selected");
      showNotification("❌ Please select a rating first");
    }
  };

  // Handle review submission
  const handleReviewSubmit = () => {
    if (newReview.trim()) {
      const newReviewObj = {
        id: reviews.length + 1,
        user: "You", // In real app, this would come from user profile
        rating: userRating || 8, // Use user's rating or default
        comment: newReview.trim(),
        date: new Date().toISOString().split('T')[0],
        helpful: 0
      };
      
      setReviews([newReviewObj, ...reviews]);
      setNewReview("");
      showNotification("Review posted successfully!");
      console.log("Review submitted:", newReviewObj);
    }
  };

  // Handle helpful vote
  const handleHelpfulVote = (reviewId) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
    showNotification("Thank you for your feedback!");
  };

  // Handle trailer play (mock functionality)
  const handlePlayTrailer = () => {
    showNotification("Opening trailer... (Demo functionality)");
    // In real app, this would open a video player or redirect to trailer
    console.log(`Playing trailer for: ${movie.name}`);
  };

  // Clear user rating
  const clearRating = () => {
    setUserRating(0);
    setHoveredRating(0);
  };

  if (!movie) {
    return (
      <section className="px-8 py-6">
        <div className="text-center text-red-400 text-xl">
          Movie not found
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
            src={movie.image}
            alt={movie.name}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center px-12">
            <div className="flex gap-8 items-center max-w-4xl">
              <img
                src={movie.image}
                alt={movie.name}
                className="w-48 h-72 object-cover rounded-xl shadow-2xl border-2 border-[#f5c518]"
              />
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-[#f5c518] mb-4 drop-shadow-lg">
                  {movie.name}
                </h1>
                <p className="text-gray-200 text-lg mb-6 leading-relaxed max-w-2xl">
                  {movie.desc}
                </p>
                
                {/* Movie Info */}
                <div className="flex items-center gap-6 mb-6">
                  <span className="text-lg font-bold bg-[#f5c518] text-black px-3 py-1 rounded">
                    {movie.year}
                  </span>
                  <div className="flex items-center gap-2">
                    <FaStar className="text-[#f5c518]" />
                    <span className="text-white text-lg font-semibold">{movieRating}/10</span>
                    <span className="text-gray-400 text-sm">({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</span>
                  </div>
                  <span className="bg-[#232323] text-[#f5c518] px-3 py-1 rounded border border-[#f5c518]">
                    {movie.category}
                  </span>
                  {movie.trending && (
                    <span className="bg-red-600 text-white px-3 py-1 rounded font-semibold">
                      TRENDING
                    </span>
                  )}
                  {movie.top && (
                    <span className="bg-green-600 text-white px-3 py-1 rounded font-semibold">
                      TOP RATED
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePlayTrailer}
                    className="bg-[#f5c518] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#e5b91f] transition-colors flex items-center gap-2"
                  >
                    <FaPlay /> Watch Trailer
                  </button>
                  <button
                    onClick={handleWatchlistToggle}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      isWatchlisted
                        ? "bg-[#f5c518] text-black"
                        : "bg-[#232323] text-[#f5c518] border border-[#f5c518] hover:bg-[#f5c518] hover:text-black"
                    }`}
                  >
                    <FaBookmark /> {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
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

        {/* Tabs Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-[#333]">
            {["overview", "reviews", "rating"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 text-lg font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "text-[#f5c518] border-b-2 border-[#f5c518]"
                    : "text-gray-400 hover:text-[#f5c518]"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="bg-[#232323] rounded-xl p-8">
                <h2 className="text-2xl font-bold text-[#f5c518] mb-6">Overview</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Synopsis</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {movie.desc} This compelling narrative explores themes of friendship, courage, and personal growth while delivering spectacular action sequences and emotional depth. The story unfolds with carefully crafted character arcs that will keep you invested from beginning to end.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-[#f5c518] mb-2">Details</h4>
                      <div className="space-y-2 text-gray-300">
                        <p><span className="text-white font-medium">Release Year:</span> {movie.year}</p>
                        <p><span className="text-white font-medium">Genre:</span> {movie.category}</p>
                        <p><span className="text-white font-medium">Duration:</span> 2h 15min</p>
                        <p><span className="text-white font-medium">Language:</span> Japanese</p>
                        <p><span className="text-white font-medium">Status:</span> {movie.upcoming ? "Upcoming" : "Released"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-[#f5c518] mb-2">Cast & Crew</h4>
                      <div className="space-y-2 text-gray-300">
                        <p><span className="text-white font-medium">Director:</span> Tsutomu Hanabusa</p>
                        <p><span className="text-white font-medium">Writer:</span> Ken Wakui</p>
                        <p><span className="text-white font-medium">Studio:</span> Liden Films</p>
                        <p><span className="text-white font-medium">Producer:</span> Studio Pony Canyon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="bg-[#232323] rounded-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#f5c518]">Reviews</h2>
                  <span className="text-gray-400">{reviews.length} reviews</span>
                </div>

                {/* Add Review Section */}
                <SignedIn>
                  <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
                    <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="Share your thoughts about this movie..."
                      className="w-full bg-[#333] text-white p-4 rounded-lg border border-[#555] focus:border-[#f5c518] focus:outline-none resize-none"
                      rows="4"
                    />
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-gray-400 text-sm">
                        {newReview.length}/500 characters
                      </span>
                      <button
                        onClick={handleReviewSubmit}
                        disabled={!newReview.trim()}
                        className="bg-[#f5c518] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#e5b91f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Post Review
                      </button>
                    </div>
                  </div>
                </SignedIn>

                <SignedOut>
                  <div className="bg-[#1a1a1a] rounded-lg p-6 text-center">
                    <p className="text-gray-400 mb-4">Sign in to write a review</p>
                    <SignInButton mode="modal">
                      <button className="bg-[#f5c518] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#e5b91f] transition-colors">
                        Sign In to Review
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-[#1a1a1a] rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#f5c518] rounded-full flex items-center justify-center text-black font-bold">
                            {review.user[0]}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{review.user}</h4>
                            <p className="text-gray-400 text-sm">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} />
                          <span className="text-[#f5c518] font-semibold">{review.rating}/10</span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4 leading-relaxed">{review.comment}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <button 
                          onClick={() => handleHelpfulVote(review.id)}
                          className="text-gray-400 hover:text-[#f5c518] transition-colors"
                        >
                          👍 Helpful ({review.helpful})
                        </button>
                        <button className="text-gray-400 hover:text-[#f5c518] transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rating Tab */}
            {activeTab === "rating" && (
              <div className="bg-[#232323] rounded-xl p-8">
                <h2 className="text-2xl font-bold text-[#f5c518] mb-6">Rate This Movie</h2>
                
                {/* Always show rating interface for demo */}
                <div className="text-center">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Rate This Movie</h3>
                    <p className="text-gray-300">
                      {userHasRated 
                        ? `You rated this movie ${userRating}/10. Click to update your rating.`
                        : "Click on a number to give your rating (1-10)"
                      }
                    </p>
                  </div>
                  
                  {userHasRated && (
                    <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#f5c518]">
                      <p className="text-[#f5c518] text-lg">
                        ⭐ Your current rating: <span className="font-bold text-2xl">{userRating}/10</span>
                      </p>
                    </div>
                  )}
                  
                  {/* Rating Selection */}
                  <div className="mb-8">
                    <p className="text-gray-400 mb-4">
                      {hoveredRating > 0 
                        ? `You're about to rate: ${hoveredRating}/10`
                        : userRating > 0 
                          ? `Selected rating: ${userRating}/10`
                          : "Hover over numbers to preview your rating"
                      }
                    </p>
                    
                    <div className="flex justify-center items-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <button
                          key={rating}
                          onMouseEnter={() => setHoveredRating(rating)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => {
                            console.log("Rating button clicked:", rating);
                            setUserRating(rating);
                          }}
                          className={`w-12 h-12 rounded-lg border-2 font-bold text-lg transition-all transform hover:scale-110 cursor-pointer ${
                            rating <= (hoveredRating || userRating)
                              ? "bg-[#f5c518] text-black border-[#f5c518] shadow-lg"
                              : "bg-[#1a1a1a] text-gray-400 border-gray-600 hover:border-[#f5c518] hover:text-white"
                          }`}
                          title={`Rate ${rating} out of 10`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    
                    {/* Rating Labels */}
                    <div className="flex justify-between text-xs text-gray-500 mb-6 max-w-md mx-auto">
                      <span>Terrible</span>
                      <span>Poor</span>
                      <span>Average</span>
                      <span>Good</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {userRating > 0 && (
                    <div className="mb-8 space-y-4">
                      <div className="bg-[#1a1a1a] p-4 rounded-lg">
                        <p className="text-[#f5c518] text-xl font-semibold mb-2">
                          {userHasRated ? "Update your rating to:" : "You're about to rate:"} 
                          <span className="text-2xl ml-2">{userRating}/10</span>
                        </p>
                        <p className="text-gray-400 text-sm">
                          {userRating <= 3 && "You didn't enjoy this movie"}
                          {userRating > 3 && userRating <= 6 && "This movie was okay"}
                          {userRating > 6 && userRating <= 8 && "You liked this movie"}
                          {userRating > 8 && "You loved this movie!"}
                        </p>
                      </div>
                      
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => {
                            console.log("Submit button clicked");
                            handleRatingSubmit();
                          }}
                          className="bg-[#f5c518] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#e5b91f] transition-all transform hover:scale-105 shadow-lg cursor-pointer"
                        >
                          {userHasRated ? "✓ Update My Rating" : "★ Submit Rating"}
                        </button>
                        
                        <button
                          onClick={clearRating}
                          className="bg-[#333] text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-[#444] transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Rating Statistics */}
                  <div className="mt-8 bg-[#1a1a1a] rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-[#f5c518] mb-4">📊 Community Ratings</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white">{movieRating}</div>
                        <div className="text-gray-400 text-sm">Average Rating</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{totalRatings}</div>
                        <div className="text-gray-400 text-sm">Total Ratings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{movie.rating}</div>
                        <div className="text-gray-400 text-sm">Original Score</div>
                      </div>
                    </div>
                    
                    {totalRatings > 0 && (
                      <div className="mt-6 pt-4 border-t border-[#333]">
                        <p className="text-center text-gray-400 text-sm">
                          {totalRatings === 1 
                            ? "You're the first to rate this movie!"
                            : `Join ${totalRatings} others who rated this movie`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Sign in reminder */}
                  <SignedOut>
                    <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500 rounded-lg">
                      <p className="text-blue-300 text-sm mb-2">
                        💡 Demo Mode: You can rate without signing in for testing!
                      </p>
                      <p className="text-gray-400 text-xs">
                        In production, sign in to save ratings permanently.
                      </p>
                    </div>
                  </SignedOut>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-[#232323] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#f5c518] mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">CriticScore Rating</span>
                  <span className="text-white font-semibold">{movieRating}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Ratings</span>
                  <span className="text-white font-semibold">{totalRatings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">User Reviews</span>
                  <span className="text-white font-semibold">{reviews.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Popularity</span>
                  <span className="text-white font-semibold">#
                    {movie.trending ? "1" : Math.floor(Math.random() * 100)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Watchlist</span>
                  <span className="text-white font-semibold">2.3K</span>
                </div>
              </div>
            </div>

            {/* Similar Movies */}
            <div className="bg-[#232323] rounded-xl p-6">
              <h3 className="text-xl font-bold text-[#f5c518] mb-4">Similar Movies</h3>
              <div className="space-y-3">
                {allMovies
                  .filter((m) => m.category === movie.category && m.movieId !== movie.movieId)
                  .slice(0, 3)
                  .map((similarMovie) => (
                    <Link
                      key={similarMovie.movieId}
                      to={`/movie/${similarMovie.movieId}`}
                      className="flex gap-3 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                    >
                      <img
                        src={similarMovie.image}
                        alt={similarMovie.name}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm mb-1">{similarMovie.name}</h4>
                        <p className="text-gray-400 text-xs mb-1">{similarMovie.year}</p>
                        <div className="flex items-center gap-1">
                          <FaStar className="text-[#f5c518] text-xs" />
                          <span className="text-[#f5c518] text-xs">{similarMovie.rating}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}