import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { Routes, Route, useLocation } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import MovieDetailPage from "./pages/movieDetails";
import TestPage from "./pages/TestPage";
// import apiService from "./services/api"; // Temporarily disabled

import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import TrendingPage from "./pages/TrendingPage";
import TopRatedPage from "./pages/TopRatedPage";
import CategoriesPage from "./pages/CategoriesPage";
import WatchlistPage from "./pages/WatchlistPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import apiService from "./services/api";

function GetToken() {
  const { getToken } = useAuth();
  const handleClick = async () => {
    const token = await getToken();
    console.log("Token:", token);
  };
  return <button onClick={handleClick}>Log Token</button>;
}

// fetchMovies from backend API
async function fetchMovies() {
  try {
    console.log("🎬 Fetching movies from backend API...");
    const response = await apiService.getMovies();
    console.log("🔍 Raw backend response:", response);
    
    // Backend returns { movies: [...], pagination: {...} }
    const movies = Array.isArray(response) ? response : (response?.movies || response?.data || []);
    console.log("✅ Backend movies loaded:", movies.length, "movies");
    return movies;
  } catch (error) {
    console.error("❌ Backend fetch failed:", error);
    throw new Error("Failed to fetch movies from backend");
  }
}

function App() {
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const seenIdsRef = useRef(new Set());

  // Set up auth token for API service
  React.useEffect(() => {
    if (getToken) {
      window.__clerk_token_getter = getToken;
    }
  }, [getToken]);

  // Search function
  const handleSearch = (value) => {
    setSearchQuery(value);
    
    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Search movies by name/title
    const filtered = allMovies.filter(movie =>
      movie.title?.toLowerCase().includes(value.toLowerCase()) ||
      movie.name?.toLowerCase().includes(value.toLowerCase())
    );
    
    setSearchResults(filtered);
    setShowResults(true);
  };

  // Close search results and notifications when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowResults(false);
      }
      if (!event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load movies function
  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await fetchMovies();
      setAllMovies(data);
      // Initialize seen IDs so we don't notify for existing movies on first load
      try {
        const ids = data.map((m) => m._id || m.id).filter(Boolean);
        seenIdsRef.current = new Set(ids);
      } catch (e) {
        console.warn("Could not initialize seenIdsRef:", e);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadMovies();
  }, []);

  // Poll for new movies every 30s and create notifications for users
  React.useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const latest = await fetchMovies();
        if (!mounted) return;
        const newOnes = (latest || []).filter((m) => {
          const id = m._id || m.id;
          return id && !seenIdsRef.current.has(id);
        });
        if (newOnes.length > 0) {
          // Add to notifications (newest first)
          setNotifications((prev) => [...newOnes, ...prev]);
          setUnseenCount((c) => c + newOnes.length);
          newOnes.forEach((m) => {
            const id = m._id || m.id;
            if (id) seenIdsRef.current.add(id);
          });
        }
      } catch (err) {
        console.warn("Notification poll failed:", err);
      }
    };

    const interval = setInterval(poll, 30000);
    // also run once after mount (but after initial load)
    const timeout = setTimeout(poll, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen theme-bg-primary flex theme-text-primary font-sans theme-transition">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <main className="flex-1 flex flex-col theme-bg-primary ml-0 lg:ml-60 transition-all duration-300">
        <header className="flex items-center justify-between px-4 lg:px-8 py-4 theme-bg-primary border-b theme-border">
          <div className="flex items-center gap-2 lg:gap-4 justify-between w-full">
            {/* Mobile hamburger menu */}
            <button
              className="lg:hidden p-2 rounded-lg hover:theme-bg-secondary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="relative search-container flex-1 max-w-md lg:max-w-none">
              <input
                type="search"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="settings-input px-4 py-2 rounded-lg w-full lg:w-[30rem] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder-[var(--text-secondary)] text-sm lg:text-base"
                disabled={currentPath === "/settings"}
              />
              
              {/* Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.map((movie) => (
                    <div
                      key={movie._id || movie.id}
                      className="flex items-center gap-3 p-3 hover:bg-[var(--bg-tertiary)] cursor-pointer border-b border-[var(--border-color)] last:border-b-0"
                      onClick={() => {
                        window.location.href = `/movie/${movie._id || movie.id}`;
                        setShowResults(false);
                        setSearchQuery("");
                      }}
                    >
                      <img
                        src={movie.poster || movie.image}
                        alt={movie.title || movie.name}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">
                          {movie.title || movie.name}
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {movie.year || new Date(movie.releaseDate).getFullYear()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results */}
              {showResults && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg p-4 z-50">
                  <p className="text-[var(--text-secondary)] text-center">
                    No movies found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton className="bg-[var(--accent-color)] text-[var(--bg-primary)] px-4 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-all" />
                <SignUpButton className="border-2 border-[var(--accent-color)] text-[var(--accent-color)] px-4 py-2 rounded-lg cursor-pointer hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)] transition-colors" />
              </SignedOut>
              {/* Notification bell for signed in users */}
              <SignedIn>
                <div className="relative mr-2 lg:mr-6 notification-container">
                  <button
                    onClick={() => setShowNotifications((s) => !s)}
                    className="mr-2 lg:mr-4 p-2 lg:p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                    title="Notifications"
                  >
                    <FaBell className="w-5 h-5 lg:w-6 lg:h-6" />
                    {unseenCount > 0 && (
                      <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-red-600 text-white text-xs lg:text-sm font-bold rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center">{unseenCount > 9 ? '9+' : unseenCount}</span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="fixed lg:absolute left-2 right-2 lg:left-auto lg:right-0 top-16 lg:top-auto lg:mt-2 w-auto lg:w-96 max-w-md lg:max-w-none bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50 max-h-[calc(100vh-5rem)] lg:max-h-96 overflow-hidden">
                      <div className="flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                        <strong className="text-sm lg:text-base text-[var(--text-primary)]">New Movies</strong>
                        <div className="flex items-center gap-2 lg:gap-3">
                          <button 
                            onClick={() => { setNotifications([]); setUnseenCount(0); }} 
                            className="text-xs lg:text-sm text-[var(--accent-color)] hover:text-[var(--text-primary)] font-semibold"
                          >
                            Clear All
                          </button>
                          <button 
                            onClick={() => setShowNotifications(false)} 
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
                            title="Close"
                          >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="overflow-y-auto max-h-[calc(100vh-10rem)] lg:max-h-80 mobile-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-6 lg:p-8 text-center text-xs lg:text-sm text-[var(--text-secondary)]">
                            <div className="text-3xl lg:text-4xl mb-2">🎬</div>
                            <p>No new movies yet</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-[var(--border-color)]">
                            {notifications.map((m, index) => {
                              // Debug logging
                              if (index === 0) {
                                console.log('Sample notification movie object:', m);
                                console.log('Available fields:', Object.keys(m));
                              }
                              
                              const movieId = m._id || m.id || m.movieId;
                              const movieTitle = m.title || m.name || m.movieTitle || 'Untitled Movie';
                              const moviePoster = m.poster || m.posterUrl || m.image || m.thumbnail || 'https://via.placeholder.com/150x225?text=No+Image';
                              const movieYear = m.year || (m.releaseDate ? new Date(m.releaseDate).getFullYear() : '') || (m.release_date ? new Date(m.release_date).getFullYear() : '');
                              const movieGenre = Array.isArray(m.genre) ? m.genre.slice(0, 2).join(', ') : (typeof m.genre === 'string' ? m.genre : '');
                              const movieDirector = m.director || '';
                              const movieRating = m.averageRating || m.rating || 0;
                              
                              return (
                                <div 
                                  key={movieId || `movie-${index}`} 
                                  className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors active:bg-[var(--bg-tertiary)]" 
                                  onClick={() => { 
                                    console.log('Clicking movie notification:', { movieId, movieTitle, fullMovie: m });
                                    if (movieId) {
                                      navigate(`/movie/${movieId}`); 
                                      setShowNotifications(false); 
                                      setUnseenCount(0);
                                    } else {
                                      console.error('No valid movie ID found for navigation');
                                    }
                                  }}
                                >
                                  {moviePoster && (
                                    <img 
                                      src={moviePoster} 
                                      alt={movieTitle} 
                                      className="w-12 h-16 lg:w-16 lg:h-24 object-cover rounded shadow-md flex-shrink-0 bg-[var(--bg-tertiary)]"
                                      onError={(e) => { 
                                        console.log('Image failed to load:', moviePoster);
                                        e.target.src = 'https://via.placeholder.com/150x225?text=No+Image'; 
                                      }}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[var(--text-primary)] mb-1 text-xs lg:text-sm leading-tight truncate">
                                      {movieTitle}
                                    </h4>
                                    <div className="flex flex-col gap-0.5 lg:gap-1 text-[10px] lg:text-xs text-[var(--text-secondary)]">
                                      {movieYear && (
                                        <div className="flex items-center gap-1 lg:gap-2">
                                          <span className="font-semibold">📅 {movieYear}</span>
                                        </div>
                                      )}
                                      {movieGenre && (
                                        <div className="flex items-center gap-1 truncate">
                                          <span className="truncate">🎭 {movieGenre}</span>
                                        </div>
                                      )}
                                      {movieDirector && (
                                        <div className="hidden lg:flex items-center gap-1 truncate">
                                          <span className="truncate">🎬 {movieDirector}</span>
                                        </div>
                                      )}
                                      {movieRating > 0 && (
                                        <div className="flex items-center gap-1">
                                          <span>⭐ {movieRating.toFixed(1)}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] lg:text-xs mt-1 lg:mt-2">
                                      <span className="bg-[var(--accent-color)] text-[var(--bg-primary)] px-1.5 lg:px-2 py-0.5 rounded-full font-semibold">
                                        NEW
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </SignedIn>
            </div>
          </div>
          <div>
            <SignedIn>
              <UserButton  />
            </SignedIn>
          </div>
        </header>

        {/* <GetToken /> */}

        <Routes>
          <Route
            path="/"
            element={
              <HomePage allMovies={allMovies} loading={loading} error={error} />
            }
          />
          <Route path="/trending" element={<TrendingPage key={allMovies.length} allMovies={allMovies} loading={loading} error={error} />} />
          <Route path="/top" element={<TopRatedPage key={allMovies.length} allMovies={allMovies} loading={loading} error={error} />} />
          <Route path="/categories" element={<CategoriesPage allMovies={allMovies} loading={loading} error={error} />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminDashboard onMovieChange={() => loadMovies()} onMovieAdded={(movie) => {
            if (!movie) return;
            // Add to notifications for admin client immediately
            setNotifications((prev) => [movie, ...prev]);
            setUnseenCount((c) => c + 1);
            const id = movie._id || movie.id;
            if (id) seenIdsRef.current.add(id);
            // Also refresh movies list
            loadMovies();
          }} />} />
          <Route path="/test" element={<TestPage />} />
          <Route
            path="/movie/:id"
            element={<MovieDetailPage allMovies={allMovies} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
