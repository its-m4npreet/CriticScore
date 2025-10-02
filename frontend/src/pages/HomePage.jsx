import React, { useState } from "react";
import MovieCard from "../components/MovieCard";

export default function HomePage({ allMovies, loading, error }) {
  const [activeCategory, setActiveCategory] = useState(null);
  
  let filteredMovies = allMovies;
  if (activeCategory) {
    filteredMovies = filteredMovies.filter((m) => m.category === activeCategory);
  }

  const categories = Array.from(new Set(allMovies.map((m) => m.category)));
  const bannerImg = allMovies[0]?.image || "";
  const bannerTitle = "Discover Amazing Movies & Anime";
  const bannerDesc = "Experience the best ratings and reviews from the CriticScore community.";

  return (
    <section className="px-8 py-6">
      <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[var(--accent-color)] relative h-56 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center mb-8">
        <img
          src={bannerImg}
          alt="Banner"
          className="object-cover w-full h-full opacity-60 absolute top-0 left-0"
        />
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-extrabold mb-2 tracking-wide text-[var(--accent-color)] drop-shadow-lg">
            {bannerTitle}
          </h2>
          <p className="text-gray-200 text-lg drop-shadow">{bannerDesc}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-[var(--accent-color)] tracking-wide">Home</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={
              `font-semibold px-4 py-2 text-base text-center shadow rounded border transition-colors ` +
              (activeCategory === cat
                ? "bg-[var(--accent-color)] text-[var(--bg-primary)] border-[var(--accent-color)]"
                : "bg-[var(--bg-secondary)] text-[var(--accent-color)] border-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)]")
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Movies Content Area */}
      <div className="min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-[var(--accent-color)]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--accent-color)] mb-4"></div>
            <span className="text-xl font-bold">Loading movies...</span>
            <span className="text-sm text-gray-400 mt-2">Discovering amazing content for you</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-red-400 text-xl font-bold">
            {error}
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
      </div>
    </section>
  );
}