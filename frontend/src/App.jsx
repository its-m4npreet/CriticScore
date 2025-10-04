import React, { useState } from "react";
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
import apiService from "./services/api";

import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import TrendingPage from "./pages/TrendingPage";
import TopRatedPage from "./pages/TopRatedPage";
import CategoriesPage from "./pages/CategoriesPage";
import WatchlistPage from "./pages/WatchlistPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";

function GetToken() {
  const { getToken } = useAuth();
  const handleClick = async () => {
    const token = await getToken();
    console.log("Token:", token);
  };
  return <button onClick={handleClick}>Log Token</button>;
}

// fetchMovies tries backend first, falls back to local data
async function fetchMovies() {
  try {
    // Try to fetch from backend first
    const backendData = await apiService.getMovies();
    if (backendData && backendData.movies) {
      // Keep backend data structure and add frontend-compatible fields
      const convertedMovies = backendData.movies.map((movie) => ({
        // Backend fields
        _id: movie._id,
        title: movie.title,
        description: movie.description,
        poster: movie.poster,
        releaseDate: movie.releaseDate,
        averageRating: movie.averageRating,
        genre: movie.genre,
        director: movie.director,
        cast: movie.cast,
        duration: movie.duration,
        language: movie.language,
        country: movie.country,
        featured: movie.featured,
        isActive: movie.isActive,
        // Frontend-compatible fields
        name: movie.title,
        image: movie.poster || "https://via.placeholder.com/300x400",
        desc: movie.description,
        year: new Date(movie.releaseDate).getFullYear(),
        rating: movie.averageRating || 0,
        trending: movie.featured || false,
        top: (movie.averageRating || 0) > 8,
        category: movie.genre?.[0] || "Drama",
        upcoming: false,
        watchlist: false,
        movieId: movie._id,
      }));
      return convertedMovies;
    }
  } catch (backendError) {
    console.warn("Backend fetch failed, trying local data:", backendError);
  }

  // Fallback to local data
  const res = await fetch("/src/data.json");
  if (!res.ok) throw new Error("Failed to fetch local movies");
  const localData = await res.json();
  return localData;
}

function App() {
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { getToken } = useAuth();

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

  // Close search results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const data = await fetchMovies();
        setAllMovies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  return (
    <div className="min-h-screen theme-bg-primary flex theme-text-primary font-sans theme-transition">
      <Sidebar />
            <main className="flex-1 flex flex-col theme-bg-primary ml-60">
                <header className="flex items-center justify-between px-8 py-4 theme-bg-primary border-b theme-border">
          <div className="flex items-center gap-4 justify-between w-full">
            <div className="relative search-container">
              <input
                type="search"
                placeholder="Search movies by name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="settings-input px-4 py-2 rounded-lg w-[30rem] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder-[var(--text-secondary)]"
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
            <div className="flex items-center gap-8">
              <SignedOut>
                <SignInButton className="bg-[var(--accent-color)] text-[var(--bg-primary)] px-4 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-all" />
                <SignUpButton className="border-2 border-[var(--accent-color)] text-[var(--accent-color)] px-4 py-2 rounded-lg cursor-pointer hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)] transition-colors" />
              </SignedOut>
            </div>
          </div>
          <div>
            <SignedIn>
              <UserButton  />
            </SignedIn>
          </div>
        </header>

        <GetToken />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage allMovies={allMovies} loading={loading} error={error} />
            }
          />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/top" element={<TopRatedPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
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
