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
  const location = useLocation();
  const currentPath = location.pathname;
  const { getToken } = useAuth();

  // Set up auth token for API service
  React.useEffect(() => {
    if (getToken) {
      window.__clerk_token_getter = getToken;
    }
  }, [getToken]);

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
            <input
              type="search"
              placeholder="Search movies, shows, people..."
              className="settings-input px-4 py-2 rounded-lg w-[30rem] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder-[var(--text-secondary)]"
              disabled={currentPath === "/settings"}
            />
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
