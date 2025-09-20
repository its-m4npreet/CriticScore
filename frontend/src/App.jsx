import React, { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import Sidebar from "./components/Sidebar";
import MovieCard from "./components/MovieCard";

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
  const [currentPage, setCurrentPage] = useState("home");
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

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

  // Banner and page title logic
  let filteredMovies = allMovies;
  if (activeCategory && currentPage !== "settings") {
    filteredMovies = filteredMovies.filter(
      (m) => m.category === activeCategory
    );
  }
  let pageTitle = "Home";
  // Get unique categories from allMovies (not filtered)
  const categories = Array.from(new Set(allMovies.map((m) => m.category)));
  let bannerImg = allMovies[0]?.image || "";
  let bannerTitle = "Discover Amazing Movies & Anime";
  let bannerDesc =
    "Experience the best ratings and reviews from the CriticScore community.";

  if (currentPage === "trending") {
    filteredMovies = allMovies.filter((m) => m.trending);
    pageTitle = "Trending Now";
    bannerImg = allMovies.find((m) => m.trending)?.image || bannerImg;
    bannerTitle = "What's Hot Right Now";
    bannerDesc = "See what's trending in the world of movies and anime.";
  } else if (currentPage === "top") {
    filteredMovies = allMovies.filter((m) => m.top);
    pageTitle = "Top Rated";
    bannerImg = allMovies.find((m) => m.top)?.image || bannerImg;
    bannerTitle = "Highest Rated Titles";
    bannerDesc = "The best of the best, as rated by our community.";
  } else if (currentPage === "categories") {
    filteredMovies = allMovies;
    pageTitle = "Categories";
    bannerTitle = "Browse by Category";
    bannerDesc = "Find movies and anime by your favorite genres.";
  } else if (currentPage === "watchlist") {
    filteredMovies = allMovies.filter((m) => m.watchlist);
    pageTitle = "Your Watchlist";
    bannerTitle = "Your Watchlist";
    bannerDesc = "Movies and anime you want to watch.";
  } else if (currentPage === "upcoming") {
    filteredMovies = allMovies.filter((m) => m.upcoming);
    pageTitle = "Upcoming";
    bannerTitle = "Upcoming Releases";
    bannerDesc = "Stay tuned for these new and exciting titles.";
  } else if (currentPage === "settings") {
    filteredMovies = [];
    pageTitle = "Settings";
    bannerTitle = "Settings";
    bannerDesc = "Manage your CriticScore preferences.";
  }

  return (
    <div className="min-h-screen bg-[#141414] flex text-white font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 flex flex-col bg-[#141414] ml-60">
        <header className="flex items-center justify-between px-8 py-6 bg-[#141414] border-b border-[#222]">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search movies, shows, people..."
              className="bg-[#232323] text-white px-4 py-2 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-[#f5c518] placeholder-gray-400"
              disabled={currentPage === "settings"}
            />
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
          </div>
          <div>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>
        <section className="px-8 py-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[#f5c518] relative h-56 bg-gradient-to-r from-[#232323] to-[#141414] flex items-center justify-center mb-8">
            <img
              src={bannerImg}
              alt="Banner"
              className="object-cover w-full h-full opacity-60 absolute top-0 left-0"
            />
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-extrabold mb-2 tracking-wide text-[#f5c518] drop-shadow-lg">
                {bannerTitle}
              </h2>
              <p className="text-gray-200 text-lg drop-shadow">{bannerDesc}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-[#f5c518] tracking-wide">
              {pageTitle}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={
                  `font-semibold px-4 py-2 text-base text-center shadow rounded border transition-colors ` +
                  (activeCategory === cat
                    ? "bg-[#f5c518] text-black border-[#f5c518]"
                    : "bg-[#232323] text-[#f5c518] border-[#f5c518] hover:bg-[#f5c518] hover:text-black")
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center w-full h-32 text-[#f5c518] text-xl font-bold">
              Loading movies...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center w-full h-32 text-red-400 text-xl font-bold">
              {error}
            </div>
          ) : currentPage === "settings" ? (
            <div className="text-gray-300 text-lg">
              Settings page coming soon.
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="text-gray-400 text-lg">
              No movies found for this page.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
              {filteredMovies.map((movie, idx) => (
                <MovieCard key={idx} movie={movie} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
