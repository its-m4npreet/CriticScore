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

import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import TrendingPage from "./pages/TrendingPage";
import SettingsPage from "./pages/SettingsPage";
// import MovieDetailPage from "./pages/MovieDetailPage";
import MovieDetailPage  from "./pages/movieDetails";

function GetToken() {
  const { getToken } = useAuth();
  const handleClick = async () => {
    const token = await getToken();
    console.log("Token:", token);
  };
  return <button onClick={handleClick}>Log Token</button>;
}

// fetchMovies simulates a backend call to /src/data.json
function fetchMovies() {
  return new Promise((resolve, reject) => {
    fetch("/src/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch movies");
        return res.json();
      })
      .then(resolve)
      .catch(reject);
  });
}

function App() {
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const currentPath = location.pathname;

  React.useEffect(() => {
    setLoading(true);
    fetchMovies()
      .then((data) => {
        setAllMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] flex text-white font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-[#141414] ml-60">
        <header className="flex items-center justify-between px-8 py-4 bg-[#141414] border-b border-[#222]">
          <div className="flex items-center gap-4 justify-between w-full">
            <input
              type="search"
              placeholder="Search movies, shows, people..."
              className="bg-[#232323] text-white px-4 py-2 rounded-lg w-[30rem] focus:outline-none focus:ring-2 focus:ring-[#f5c518] placeholder-gray-400"
              disabled={currentPath === "/settings"}
            />
            <div className="flex items-center gap-8">
              <SignedOut>
                <SignInButton className="bg-[#f5c518] text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-[#e5b91f]" />
                <SignUpButton className="border-1 border-[#f5c518] text-[#f5c518] px-4 py-2 rounded-lg cursor-pointer hover:bg-[#f5c518] hover:text-black transition-colors" />
              </SignedOut>
            </div>
          </div>
          <div>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>

        <GetToken />
        
        <Routes>
          <Route 
            path="/" 
            element={<HomePage allMovies={allMovies} loading={loading} error={error} />} 
          />
          <Route 
            path="/trending" 
            element={<TrendingPage allMovies={allMovies} loading={loading} error={error} />} 
          />
          <Route 
            path="/top" 
            element={<HomePage allMovies={allMovies.filter(m => m.top)} loading={loading} error={error} />} 
          />
          <Route 
            path="/categories" 
            element={<HomePage allMovies={allMovies} loading={loading} error={error} />} 
          />
          <Route 
            path="/watchlist" 
            element={<HomePage allMovies={allMovies.filter(m => m.watchlist)} loading={loading} error={error} />} 
          />
          <Route 
            path="/upcoming" 
            element={<HomePage allMovies={allMovies.filter(m => m.upcoming)} loading={loading} error={error} />} 
          />
          <Route 
            path="/settings" 
            element={<SettingsPage />} 
          />
          <Route 
            path="/movie/:id" 
            // element={<MovieDetailPage allMovies={allMovies} />} 
             element={<MovieDetailPage allMovies={allMovies} />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;