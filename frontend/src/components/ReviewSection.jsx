import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { FaStar, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import StarRating from "./StarRating";
import NumberRating from "./NumberRating";
import apiService from "../services/api";

export default function ReviewSection({ movieId, onReviewUpdate }) {
  const { isSignedIn, getToken } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    review: "",
    isPublic: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Set up auth token for API service
  useEffect(() => {
    if (getToken) {
      window.__clerk_token_getter = getToken;
    }
  }, [getToken]);

  const loadMovieData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Only try to load from backend if movieId looks like a valid MongoDB ObjectId
      if (!movieId || movieId.length < 20) {
        setError("Invalid movie ID");
        return;
      }

      // Load movie details including user rating
      const movieData = await apiService.getMovieById(movieId);

      if (movieData.userRating) {
        setUserRating(movieData.userRating);
        setReviewForm({
          rating: movieData.userRating.rating,
          review: movieData.userRating.review || "",
          isPublic:
            movieData.userRating.isPublic !== undefined
              ? movieData.userRating.isPublic
              : true,
        });
      } else {
        setUserRating(null);
        setReviewForm({
          rating: 0,
          review: "",
          isPublic: true,
        });
      }

      // Load movie reviews
      const ratingsData = await apiService.getMovieRatings(movieId, {
        limit: 10,
        sortBy: "helpfulVotes",
        sortOrder: "desc",
      });

      setReviews(ratingsData.ratings || []);
    } catch (err) {
      console.error("Failed to load movie data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  // Load user rating and movie reviews
  useEffect(() => {
    loadMovieData();
  }, [loadMovieData, isSignedIn]);

  const handleRatingChange = (newRating) => {
    setReviewForm((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!isSignedIn) {
      setError("You must be signed in to rate movies");
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 10) {
      setError("Please select a rating between 1 and 10");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await apiService.createOrUpdateRating(movieId, {
        rating: reviewForm.rating,
        review: reviewForm.review.trim(),
        isPublic: reviewForm.isPublic,
      });

      setUserRating(result.data);
      setShowReviewForm(false);
      setEditingReview(null);

      // Reload reviews to show updated data
      await loadMovieData();

      // Notify parent component about the update
      if (onReviewUpdate) {
        onReviewUpdate(result.data);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm("Are you sure you want to delete your review?")) {
      return;
    }

    setSubmitting(true);
    try {
      await apiService.deleteRating(movieId);
      setUserRating(null);
      setReviewForm({ rating: 0, review: "", isPublic: true });
      setShowReviewForm(false);
      await loadMovieData();

      if (onReviewUpdate) {
        onReviewUpdate(null);
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulClick = async (ratingId, isCurrentlyHelpful) => {
    if (!isSignedIn) return;

    try {
      if (isCurrentlyHelpful) {
        await apiService.removeHelpfulMark(ratingId);
      } else {
        await apiService.markReviewHelpful(ratingId);
      }

      // Reload reviews to show updated helpful counts
      await loadMovieData();
    } catch (err) {
      console.error("Failed to update helpful status:", err);
    }
  };

  const startEditing = () => {
    setEditingReview(true);
    setShowReviewForm(true);
  };

  const cancelEditing = () => {
    setEditingReview(false);
    setShowReviewForm(false);
    if (userRating) {
      setReviewForm({
        rating: userRating.rating,
        review: userRating.review || "",
        isPublic: userRating.isPublic,
      });
    } else {
      setReviewForm({ rating: 0, review: "", isPublic: true });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 theme-border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="theme-error-bg border theme-error-border theme-error-text px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* User Rating Section */}
      <div className="theme-bg-secondary rounded-xl p-4 lg:p-6">
        <h3 className="text-lg lg:text-xl font-bold theme-accent mb-3 lg:mb-4">Your Review</h3>

        {isSignedIn ? (
          <div>
            {userRating && !showReviewForm ? (
              <div className="space-y-3 lg:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
                    <StarRating rating={userRating.rating} size="medium" />
                    <span className="text-xl lg:text-2xl font-bold theme-accent whitespace-nowrap">
                      {userRating.rating}/10
                    </span>
                  </div>
                  <div className="flex gap-2 self-start sm:self-auto">
                    <button
                      onClick={startEditing}
                      className="text-blue-400 hover:text-blue-300 active:scale-95 p-2 rounded transition-transform"
                      title="Edit Review"
                    >
                      <FaEdit className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      className="text-red-400 hover:text-red-300 active:scale-95 p-2 rounded transition-transform"
                      title="Delete Review"
                      disabled={submitting}
                    >
                      <FaTrash className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>
                </div>

                {userRating.review && (
                  <div className="theme-bg-tertiary rounded-lg p-3 lg:p-4">
                    <p className="theme-text-primary leading-relaxed text-sm lg:text-base break-words">
                      {userRating.review}
                    </p>
                  </div>
                )}

                <div className="text-xs lg:text-sm theme-text-secondary">
                  {userRating.isPublic
                    ? "🌐 Public review"
                    : "🔒 Private review"}
                </div>
              </div>
            ) : (
              <div>
                {!showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="theme-button-primary px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm lg:text-base font-semibold hover:theme-button-primary-hover transition-colors w-full sm:w-auto"
                  >
                    {userRating ? "Edit Your Review" : "Write a Review"}
                  </button>
                )}

                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="space-y-3 lg:space-y-4">
                    <div className="overflow-x-auto -mx-2 px-2">
                      <NumberRating
                        rating={reviewForm.rating}
                        onRatingChange={handleRatingChange}
                        interactive={true}
                        showLabel={true}
                      />
                    </div>

                    <div>
                      <label className="block text-xs lg:text-sm font-medium theme-text-primary mb-2">
                        Review (Optional)
                      </label>
                      <textarea
                        value={reviewForm.review}
                        onChange={(e) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            review: e.target.value,
                          }))
                        }
                        placeholder="Share your thoughts about this movie..."
                        rows={4}
                        maxLength={1000}
                        className="w-full theme-input rounded-lg px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border theme-border focus:theme-border-accent focus:outline-none resize-vertical"
                      />
                      <div className="text-right text-xs lg:text-sm theme-text-secondary mt-1">
                        {reviewForm.review.length}/1000 characters
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={reviewForm.isPublic}
                        onChange={(e) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            isPublic: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <label
                        htmlFor="isPublic"
                        className="text-xs lg:text-sm theme-text-primary"
                      >
                        Make this review public
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                      <button
                        type="submit"
                        disabled={submitting || reviewForm.rating === 0}
                        className="theme-button-primary px-4 lg:px-6 py-2 rounded-lg text-sm lg:text-base font-semibold hover:theme-button-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
                      >
                        <FaSave />
                        {submitting
                          ? "Saving..."
                          : editingReview
                          ? "Update Review"
                          : "Submit Review"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="theme-button-secondary px-4 lg:px-6 py-2 rounded-lg text-sm lg:text-base font-semibold hover:theme-button-secondary-hover flex items-center justify-center gap-2 w-full sm:w-auto"
                      >
                        <FaTimes />
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 lg:py-8">
            <p className="theme-text-secondary mb-4 text-sm lg:text-base">
              Sign in to rate and review this movie
            </p>
          </div>
        )}
      </div>

      {/* Other Reviews Section */}
      <div className="theme-bg-secondary rounded-xl p-4 lg:p-6">
        <h3 className="text-lg lg:text-xl font-bold theme-text-primary mb-3 lg:mb-4">
          Reviews ({reviews.length})
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-3 lg:space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="theme-bg-tertiary rounded-lg p-3 lg:p-4 border-l-4 theme-border-accent"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 mb-2">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 min-w-0">
                    <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                      <StarRating rating={review.rating} size="small" />
                      <span className="font-bold theme-accent text-sm lg:text-base whitespace-nowrap">
                        {review.rating}/10
                      </span>
                    </div>
                    <span className="theme-text-secondary text-xs lg:text-sm truncate">
                      by <span className="font-medium">{review.userId}</span>
                    </span>
                  </div>
                  <div className="theme-text-secondary text-xs lg:text-sm flex-shrink-0">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {review.review && (
                  <p className="theme-text-primary leading-relaxed mb-3 text-sm lg:text-base break-words">
                    {review.review}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      handleHelpfulClick(
                        review._id,
                        review.helpfulBy?.includes("currentUser")
                      )
                    }
                    className="theme-text-secondary hover:theme-accent text-xs lg:text-sm flex items-center gap-1 active:scale-95 transition-transform"
                    disabled={!isSignedIn}
                  >
                    👍 Helpful ({review.helpfulVotes})
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 lg:py-8 theme-text-secondary text-sm lg:text-base">
            No reviews yet. Be the first to review this movie!
          </div>
        )}
      </div>
    </div>
  );
}
